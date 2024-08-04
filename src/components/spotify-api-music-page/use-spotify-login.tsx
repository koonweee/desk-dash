'use client';
import CryptoJS from 'crypto-js';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-modify-playback-state',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-top-read',
  'user-read-recently-played',
  'user-library-read',
  'streaming',
];
const SCOPE = SCOPES.join(' ');

function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// function sha256Encoder(data: string) {
//   const encoder = new TextEncoder();
//   const dataBytes = encoder.encode(data);
//   return crypto.subtle.digest("SHA-256", dataBytes);
// }

function base64Encoder(data: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** Workarounds because we cant use crypto.subtle.digest on non https or localhost */

/* Converts a cryptjs WordArray to native Uint8Array */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CryptJsWordArrayToUint8Array(wordArray: { sigBytes: any; words: any }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const l = wordArray.sigBytes;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const words = wordArray.words;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = new Uint8Array(l);
  let i = 0 /*dst*/,
    j = 0; /*src*/
  while (true) {
    // here i is a multiple of 4
    if (i == l) break;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l) break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l) break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l) break;
    result[i++] = w & 0x000000ff;
  }
  return result;
}

export function useSpotifyLogin() {
  // Fired when user clicks login button
  const onLogin = async () => {
    const code_verifier = generateRandomString(64);
    window.localStorage.setItem('spotify_code_verifier', code_verifier);
    const sha256ed = CryptoJS.SHA256(code_verifier);
    const code_challenge = base64Encoder(CryptJsWordArrayToUint8Array(sha256ed));
    const params = {
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      scope: SCOPE,
      code_challenge_method: 'S256',
      code_challenge: code_challenge,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
    };
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };

  return {
    onLogin,
  };
}
