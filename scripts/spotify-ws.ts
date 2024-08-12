import WebSocket from 'ws';
/**
 * Test script for Spotify Web API
 * - Checking if a access token and connect-id can be used forever if ping ponged
 */

/**
 * (lifted from https://gist.github.com/davidborzek/d2f5650c763f750de39ef534bdd43181)
 * Flow is:
 * 1. Connect to Spotify WebSocket with access token
 * 2. WebSocket returns message with `Spotify-Connection-Id` in headers
 * 3. PUT to Spotify notifications API with `Spotify-Connection-Id` and access token auth
 * 4. WebSocket starts sending messages on playback status update
 * !!Ping every 15 seconds to keep connection alive
 */

const DEFAULT_HEADERS = {
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

/**
 * Get by inspecting element and looking for accessToken: <> in Elements tab
 */
const ACCESS_TOKEN =
  'BQAk11rJRueICM6XqueDtvMFcWIY5aXMen9mLeLRmfwm8C764Sk281XvrnL_JIbeNoGJxfJEfg3iQPm5DWAVz0fQUl4DOGvy27Ick-YX0NsQ3gMjlffXIdVEH2siCCqHYKl4i0IgzBqdZstphnSwzATMkqpZiMikQTHxPZhxNZngROpZJ98';

if (!ACCESS_TOKEN) {
  throw new Error('No access token provided, check .env or `EXPORT SPOTIFY_ACCESS_TOKEN=<>`');
}

const createWebSocketUrl = (accessToken: string) => `wss://dealer.spotify.com/?access_token=${accessToken}`;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const ws = new WebSocket(createWebSocketUrl(ACCESS_TOKEN));

ws.onerror = (e: WebSocket.ErrorEvent) => {
  console.error('WebSocket error:', e.message);
};

const ping = () => {
  ws.send(JSON.stringify({ type: 'ping' }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logInfo = (message: string, context?: any) => {
  console.info(`[${new Date().toLocaleString()}][INFO] ${message}`);
  if (context) {
    console.info(JSON.stringify(context, null, 2));
  }
};

ws.onopen = () => {
  logInfo('Connected to Spotify WebSocket with token: ' + ACCESS_TOKEN);
  ping();
  setInterval(ping, 15000);
};

ws.onmessage = (e: WebSocket.MessageEvent) => {
  //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const messageJson: any = JSON.parse(e.data.toString());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if ('headers' in messageJson && messageJson.headers['Spotify-Connection-Id']) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const spotifyConnectionId = messageJson.headers['Spotify-Connection-Id'] as string;
    logInfo(`Received Spotify-Connection-Id: ${spotifyConnectionId}`);
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const device = {
    //   brand: 'spotify',
    //   capabilities: {
    //     audio_podcasts: true,
    //     change_volume: true,
    //     disable_connect: false,
    //     enable_play_token: true,
    //     manifest_formats: [
    //       'file_urls_mp3',
    //       'manifest_ids_video',
    //       'file_urls_external',
    //       'file_ids_mp4',
    //       'file_ids_mp4_dual',
    //     ],
    //     play_token_lost_behavior: 'pause',
    //     supports_file_media_type: true,
    //     video_playback: true,
    //   },
    //   device_id: Array(40)
    //     .fill(0)
    //     .map((x) => Math.random().toString(36).charAt(2))
    //     .join(''),
    //   device_type: 'computer',
    //   metadata: {},
    //   model: 'web_player',
    //   name: 'Web Player (Microsoft Edge)',
    //   platform_identifier: 'web_player osx 11.3.0;microsoft edge 89.0.774.54;desktop',
    // };
    // fetch('https://guc-spclient.spotify.com/track-playback/v1/devices', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     connection_id: spotifyConnectionId,
    //     client_version: 'harmony:4.21.0-a4bc573',
    //     outro_endcontent_snooping: false,
    //     volume: 65535,
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //     device,
    //   }),
    //   headers: {
    //     Authorization: `Bearer ${ACCESS_TOKEN}`,
    //     origin: 'https://open.spotify.com',
    //     ...DEFAULT_HEADERS,
    //   },
    // })
    //   .then((res) => {
    //     if (!res.ok) {
    //       throw new Error(`POST /devices failed with status: ${res.status}`);
    //     }
    //     logInfo(`POST /devices response: ${res.status} ${res.statusText}`);

    //     fetch(`https://guc3-spclient.spotify.com/connect-state/v1/devices/hobs_${device.device_id}`, {
    //       method: 'PUT',
    //       body: JSON.stringify({
    //         device: {
    //           device_info: {
    //             capabilities: {
    //               can_be_player: false,
    //               hidden: true,
    //               needs_full_player_state: true,
    //             },
    //           },
    //         },
    //         member_type: 'CONNECT_STATE',
    //       }),
    //       headers: {
    //         Authorization: `Bearer ${ACCESS_TOKEN}`,
    //         origin: 'https://open.spotify.com',
    //         ...DEFAULT_HEADERS,
    //         'x-spotify-connection-id': spotifyConnectionId,
    //       },
    //     })
    //       .then((res) => {
    //         if (!res.ok) {
    //           throw new Error(`PUT /devices failed with status: ${res.status}`);
    //         }
    //         logInfo(`PUT /devices response: ${res.status} ${res.statusText}`);
    //       })
    //       .catch((err) => {
    //         console.error('PUT /devices error:', err);
    //       });
    //   })
    //   .catch((err) => {
    //     console.error('POST /devices error:', err);
    //   });

    /** PUT request to start notifications. Seems to throw 401 Unauthorized if using token NOT from web-app */
    fetch(`https://api.spotify.com/v1/me/notifications/player?connection_id=${spotifyConnectionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        referer: 'https://open.spotify.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`PUT /me/notifications failed with status: ${res.status}`);
        }
        logInfo(`PUT /me/notifications response: ${res.status} ${res.statusText}`);
      })
      .catch((err) => {
        console.error('PUT /me/notifications error:', err);
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  } else if ('type' in messageJson && messageJson.type === 'pong') {
    logInfo('Received pong');
  } else {
    logInfo('Received message:', messageJson);
  }
};
