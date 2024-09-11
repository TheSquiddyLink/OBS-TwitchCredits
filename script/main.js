console.log("Hello World");

main();
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
    return data.access_token;
}
async function main(){
    const response = await fetch("config.json");
    const config = await response.json();
    console.log(config);

    const CLIENT_ID = config.client_id;
    const TOKEN = await refresh();
    const ID = config.id;

    console.log("Token: ", TOKEN);
    const options = {
        url: `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${ID}`,
        method: 'GET',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${TOKEN}`
        }
    };
    console.log(options)
    
    const followersDiv = document.getElementById("followers");
    
    handleRequest(options, function(response) {
        const max = 10;
        var i = 0;
        for(let follower of response.data){
            if(i >= max) break;
            let followerDiv = document.createElement("p");
            followerDiv.innerHTML = follower.user_name;
            followersDiv.appendChild(followerDiv);
            i++;
        }
    });

    const subOptions = {
        url: `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${ID}`,
        method: 'GET',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${TOKEN}`
        }
    }
    const subDiv = document.getElementById("subscribers");
    handleRequest(subOptions, function(response) {
        for (let element of response.data) {
            if(element.user_name == "SquibsLand") continue;
            tier = "- Tier " + (element.tier / 1000);
            element.user_name += " " + tier;
            let letters = element.user_name.split("");
            let sub = document.createElement("p");

            for(let i = 0; i < letters.length; i++){
                let letter = document.createElement("span");
                letter.innerHTML = letters[i];
                if(letters[i] != " ") letter.style.animationDelay = `${i * 0.2}s`;
                sub.appendChild(letter);
            }

            subDiv.appendChild(sub);
        }
        if(subDiv.children.length == 0){
            let sub = document.createElement("p");
            sub.innerHTML = "No Subscribers";
            subDiv.appendChild(sub);
        }
    });

    const vipDiv = document.getElementById("vip");
    const vipOptions ={
        url: "https://api.twitch.tv/helix/channels/vips?broadcaster_id=" + ID,
        method: 'GET',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${TOKEN}`
        }
    }

    handleRequest(vipOptions, function(response) {
        for (let element of response.data) {
            let vip = document.createElement("p");
            vip.innerHTML = element.user_name;
            vipDiv.appendChild(vip);
        }
    });

    const modDiv = document.getElementById("mod");
    const modOptions = {
        url: "https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=" + ID,
        method: 'GET',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${TOKEN}`
        }
    }

    handleRequest(modOptions, function(response) {
        for (let element of response.data) {
            if(element.user_name == "Nightbot") continue;
            let mod = document.createElement("p");
            mod.innerHTML = element.user_name;
            modDiv.appendChild(mod);
        }
    });
} 


async function handleRequest(options, callback) {
    const response = await fetch(options.url, options);
    const data = await response.json();
    callback(data);
}