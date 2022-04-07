import { REACT_APP_API_URL } from '../Components/processENV';

function handleErrors(response) {
    if (response.status !== 200) throw (response);
    return response;
}

const retrieveToken = () => localStorage.getItem('token')

const handleFetchResponse = (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    } 
    return response.ok ? response : response.json()
}

const refreshFetch = (configuration) => {
    const { refreshToken, shouldRefreshToken, fetch } = configuration

    let refreshingTokenPromise = null
    return (url, options, key) => {
        if (refreshingTokenPromise !== null) {
            return (
                refreshingTokenPromise
                    .then(() => fetch(url, options))
                    .catch(() => fetch(url, options))
            )
        }

        return fetch(url, options)
            .then(response => {
              return handleFetchResponse(response);
            })
            .then(handleErrors)
            .catch((error) => {
                if (shouldRefreshToken(error)) {
                    if (refreshingTokenPromise === null) {
                        refreshingTokenPromise = new Promise((resolve, reject) => {
                            refreshToken()
                                .then(() => {
                                    console.log('refresh token')
                                    refreshingTokenPromise = null
                                    resolve()
                                })
                                .catch(refreshTokenError => {
                                    refreshingTokenPromise = null
                                    reject(refreshTokenError)
                                })
                        })
                    }

                    return refreshingTokenPromise
                        .catch(() => {
                            throw error
                        })
                        .then(() => {
                            const responseURL = `${REACT_APP_API_URL}/media/${key}?mf=${retrieveToken()}`;  
                            return fetch(responseURL).then(response => {
                                return handleFetchResponse(response);
                              })
                              .then(handleErrors)
                        })
                } else {
                    throw error?.message
                }
            })
    }
}

export default refreshFetch
