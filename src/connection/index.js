import request from '../request'


export default class Connection {
    constructor(path, headers) {
        this.path = path
        this.headers = headers
    }

    getApiUrls(endpoints) {
        return this.path + {
            'blocks': 'blocks',
            'blocksDetail': 'blocks/%(blockId)s',
            'outputs': 'outputs',
            'statuses': 'statuses',
            'transactions': 'transactions',
            'transactionsDetail': 'transactions/%(transactionId)s',
            'assets': 'assets',
            'votes': 'votes'
        }[endpoints]
    }

    _req(path, options = {}) {
        // NOTE: `options.headers` could be undefined, but that's OK.
        options.headers = Object.assign({}, options.headers, this.headers)
        return request(path, options)
    }

    /**
     * @public
     * @param blockId
     */
    getBlock(blockId) {
        return this._req(this.getApiUrls('blocksDetail'), {
            urlTemplateSpec: {
                blockId
            }
        })
    }

    /**
     * @public
     * @param transactionId
     */
    getStatus(transactionId) {
        return this._req(this.getApiUrls('statuses'), {
            query: {
                transaction_id: transactionId
            }
        })
    }

    /**
     * @public
     * @param transactionId
     */
    getTransaction(transactionId) {
        return this._req(this.getApiUrls('transactionsDetail'), {
            urlTemplateSpec: {
                transactionId
            }
        })
    }

    /**
     * @public
     * @param transactionId
     * @param status
     */
    listBlocks({ transactionId, status }) {
        return this._req(this.getApiUrls('blocks'), {
            query: {
                transaction_id: transactionId,
                status
            }
        })
    }

    /**
     * @public
     * @param public_key
     * @param unspent
     * @param onlyJsonResponse
     */
    // TODO: Use camel case for parameters
    listOutputs({ public_key, unspent }, onlyJsonResponse = true) {
        return this._req(this.getApiUrls('outputs'), {
            query: {
                public_key,
                unspent
            }
        }, onlyJsonResponse)
    }

    /**
     * @public
     * @param asset_id
     * @param operation
     */
    // TODO: Use camel case for parameters
    listTransactions({ asset_id, operation }) {
        return this._req(this.getApiUrls('transactions'), {
            query: {
                asset_id,
                operation
            }
        })
    }

    /**
     * @public
     * @param blockId
     */
    listVotes(blockId) {
        return this._req(this.getApiUrls('votes'), {
            query: {
                block_id: blockId
            }
        })
    }

    /**
     * @public
     * @param txId
     * @return {Promise}
     */
    pollStatusAndFetchTransaction(txId) {
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                this.getStatus(txId)
                    .then((res) => {
                        if (res.status === 'valid') {
                            clearInterval(timer)
                            this.getTransaction(txId)
                                .then((res_) => {
                                    resolve(res_)
                                })
                        }
                    })
                    .catch((err) => {
                        clearInterval(timer)
                        reject(err)
                    })
            }, 500)
        })
    }

    /**
     * @public
     *
     * @param transaction
     */
    postTransaction(transaction) {
        return this._req(this.getApiUrls('transactions'), {
            method: 'POST',
            jsonBody: transaction
        })
    }


    /**
     * @public
     *
     * @param search
     */
    searchAssets(search) {
        return this._req(this.getApiUrls('assets'), {
            query: {
                search
            }
        })
    }
}
