console.log("Hello World");

main();

function cookieToken() {
    if(document.cookie) {
        console.log("Cookie Found");
        console.log(document.cookie);
        if(document.cookie.includes("token")){
            console.log("Token Found");
            var token = document.cookie.split("token=")[1];
            return token;
        }
    }
}

async function validate(){
    const token = cookieToken();
    if(token){
        const options = {
            url: "https://id.twitch.tv/oauth2/validate",
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }

        const response = await fetch(options.url, options);
        const data = await response.json();
        console.log("Validate")
        console.log(data);
        return data.status;

    }
}

async function refresh(){
    var status = await validate();
    
    // if(status != 401) {
    //     console.log("Token Valid");
    //     return cookieToken();
    // }

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
    // document.cookie = `token=${data.access_token}`;
    return data.access_token;
}
async function main(){
    const response = await fetch("config.json");
    const config = await response.json();
    console.log(config);

    const CLIENT_ID = config.client_id;
    const TOKEN = await refresh();
    const ID = config.id;
    const USER_NAME = config.user_name;

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
            if(element.user_name == USER_NAME) continue;
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

    const bitsImagesOptions = {
        url: "https://api.twitch.tv/helix/bits/cheermotes",
        method: 'GET',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${TOKEN}`
        }
    }

    /**
         * @typedef {Object} TierObject
         * @property {number} amount - The minimum number of bits for this tier
         * @property {string} img - The URL of the animated dark image for this tier
    */

    /**
     * @type {Array<TierObject>}
     */
    var images = []

    await handleRequest(bitsImagesOptions, function(response) {
        const data = response.data[0]
        for(let tier of data.tiers){
            let obj = {
                amount: tier.min_bits,
                img: tier.images.dark.animated[2]
            }
            images.push(obj)
        }
    });

    console.log(images);


    const bitsDiv = document.getElementById("bits");
    
    const bitsOptions = {
        url: "https://api.twitch.tv/helix/bits/leaderboard?count=10&period=all",
        method: 'GET',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${TOKEN}`
        }
    }

    handleRequest(bitsOptions, function(response) {
        let reversedIcons = images.reverse()
        for (let element of response.data) {
            let span = document.createElement("span");
            let bits = document.createElement("p");
            bits.innerHTML = element.user_name + " - " + element.score;
            span.appendChild(bits);
            let img = document.createElement("img");
            console.log(images)
            img.src= reversedIcons.find(x => element.score >= x.amount).img;
            img.classList.add("bitsAni");
            span.appendChild(img);
            bitsDiv.appendChild(span);
        }
    });


} 


async function handleRequest(options, callback) {
    const response = await fetch(options.url, options);
    const data = await response.json();
    callback(data);
}