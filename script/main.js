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
    
    
    handleRequest(options, function(response) {
        console.log(response);
    });

} 


async function handleRequest(options, callback) {
    const response = await fetch(options.url, options);
    const data = await response.json();
    callback(data);
}