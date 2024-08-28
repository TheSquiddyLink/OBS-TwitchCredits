async function refresh(){
    
    const config = await fetch("config.json");
    const configJSON = await config.json();

    const CLIENT_ID = configJSON.client_id;
    const CLIENT_SECRET = configJSON.secret;
    const REFRESH_TOKEN = configJSON.refresh_token;

    const options = {
        url: "https://id.twitch.tv/oauth2/token",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}` 
    }

    const response = await fetch(options.url, options);
    const data = await response.json();

    localStorage.setItem("token", data.access_token);
    console.log(data.access_token);
}

async function validate(){
    const access_token = localStorage.getItem("token");
    if(!access_token){
        return false;
    }

    const options = {
        url: "https://id.twitch.tv/oauth2/validate",
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }

    const response = await fetch(options.url, options);
    const data = await response.json();

    return data.status;
}

async function load(){
    const valid = await validate();
    if(valid == 401){
        await refresh();
    }
    else{
        console.log("Token is valid");
    }
}

document.addEventListener("DOMContentLoaded", load);