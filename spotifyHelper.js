var spotifyApi = require('./spotify');

var SpotifyHelper = class SpotifyHelper {
    constructor(spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     * Set the credentials given on Spotify's My Applications page.
     * https://developer.spotify.com/my-applications
     */
    async getAccessToken() {
        // Retrieve an access token
        await spotifyApi.clientCredentialsGrant().then(
        (data) => {
            console.log(data);
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
        
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        (err) => {
            console.log(
            'Something went wrong when retrieving an access token',
            err.message
            );
        }
        );
    };

    async getRefreshToken(authorizationCode){
        // When our access token will expire
        var tokenExpirationEpoch;
        // First retrieve an access token
        await spotifyApi.authorizationCodeGrant(authorizationCode).then(
            (data) => {
                // Set the access token and refresh token
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);

                // Save the amount of seconds until the access token expired
                tokenExpirationEpoch =
                new Date().getTime() / 1000 + data.body['expires_in'];
                console.log(
                'Retrieved token. It expires in ' +
                    Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                    ' seconds!'
                );
            },
            (err) => {
                console.log(
                'Something went wrong when retrieving the access token!',
                err.message
                );
            }
            );

            // Continually print out the time left until the token expires..
            var numberOfTimesUpdated = 0;

            setInterval(() => {
                
                // console.log(
                //     'Time left: ' +
                //     Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                //     ' seconds left!'
                // );

                // OK, we need to refresh the token. Stop printing and refresh.
                if (++numberOfTimesUpdated > 3500) {
                    clearInterval(this);

                    // Refresh token and print the new time to expiration.
                    spotifyApi.refreshAccessToken().then(
                    function(data) {
                        tokenExpirationEpoch =
                        new Date().getTime() / 1000 + data.body['expires_in'];
                        console.log(
                        'Refreshed token. It now expires in ' +
                            Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                            ' seconds!'
                        );
                    },
                    function(err) {
                        console.log('Could not refresh the token!', err.message);
                    }
                    );
                    numberOfTimesUpdated = 0;
                }
            }, 1000);
    }

    async getAlbum() {
        let listAlbum = [];
        await spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', { limit: 12, offset: 0 }).then(
            (data) => {

            for (let album of data.body.items) {
                listAlbum.push(album.name);
            }

            },
            (err) => {
            console.error(err);
            }
        );
        console.log(listAlbum);
        return listAlbum;
    }
};

module.exports = SpotifyHelper;