// create Agora client
var client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8"
});
var localTracks = {
  videoTrack: null,
  audioTrack: null
};
var remoteUsers = {};
// Agora client options
var options = {
  appid: null,
  channel: null,
  uid: null,
  ssid: null, // remote id that is to be observed
  token: null,
  role: "audience",
  // host or audience
  audienceLatency: 2
};

// the demo can auto join channel with params in url
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  options.uid = urlParams.get("uid");
  options.ssid = urlParams.get("ssid");
  if (options.appid && options.channel) {
    // if auto-join is wanted
    //$("#join-form").submit();
  }
});

$("#lowLatency").click(function (e) {
  options.role = "audience";
  options.audienceLatency = 1;
  $("#join-form").submit();
});
$("#ultraLowLatency").click(function (e) {
  options.role = "audience";
  options.audienceLatency = 2;
  $("#join-form").submit();
});
$("#audience-join").click(function(e) {
  $("#join-form").submit();
});
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#audience-join").attr("disabled", true);
  try {
    await join();
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
});
$("#leave").click(function (e) {
  leave();
});
async function join() {
  // create Agora client

  if (options.role === "audience") {
    client.setClientRole(options.role, {
      level: options.audienceLatency
    });
    // add event listener to play remote tracks when remote user publishs.
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
  } else {
    client.setClientRole(options.role);
  }

  // join the channel
  options.uid = await client.join(options.appid, options.channel, options.token || null, options.uid || null);
}
async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();
  $("#local-player-name").text("");
  $("#audience-join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  $("#joined-setup").css("display", "none");
  console.log("client leaves channel success");
}
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`, {
      fit: "contain"
    });
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}
function handleUserPublished(user, mediaType) {
  //print in the console log for debugging 
  console.log('"user-published" event for remote users is triggered.');
  if (mediaType === 'audio' || options.ssid === null || options.ssid === ""+user.uid) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
  }
}
function handleUserUnpublished(user, mediaType) {
  //print in the console log for debugging 
  console.log('"user-unpublished" event for remote users is triggered.');
  if (mediaType === 'video') {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
  }
}