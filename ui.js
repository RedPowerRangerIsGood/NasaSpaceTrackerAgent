// Set authorization token.
const searchWidget = document.querySelector('gen-search-widget');
const refreshToken = fetchToken();

async function fetchToken() {

    const response = await fetch('http://localhost:3000/token');
    const { refreshToken } = await response.json();
    return refreshToken;
}

console.log("Refresh Token:", refreshToken);
// searchWidget.authToken = "<JWT or OAuth token provided by your backend>";

//TODO: Implement token refresh logic to ensure the search widget always has a valid token.