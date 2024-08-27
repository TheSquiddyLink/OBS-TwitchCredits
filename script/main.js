console.log("Hello World");

main();

async function main(){
    const response = await fetch("config.json");
    const config = await response.json();
    console.log(config);

    const CLIENT_ID = config.client_id;
    const TOKEN = config.token;
    const ID = config.id;

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
        response.data.forEach(element => {
            let follower = document.createElement("p");
            follower.innerHTML = element.user_name;
            followersDiv.appendChild(follower);
        });
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
        response.data.forEach(element => {
            let sub = document.createElement("p");
            sub.innerHTML = element.user_name;
            subDiv.appendChild(sub);
        });
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
        response.data.forEach(element => {
            let vip = document.createElement("p");
            vip.innerHTML = element.user_name;
            vipDiv.appendChild(vip);
        });
    });

} 


async function handleRequest(options, callback) {
    const response = await fetch(options.url, options);
    const data = await response.json();
    callback(data);
}