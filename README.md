# agora_spectator_demo
Web client as Agora RTC audience

Access URL takes optional parameters
- appid: your Agora AppID 
- token: token that works with the appid, or omit
- channel: channel name
- uid: your desired uid, or omit
- ssid: the only remote user you want to subscribe video to; when omitted, subscribe to all

Sample URL: 
https://192.168.1.111:8080/?appid=11100e97fd319264e&channel=demo&ssid=8888
