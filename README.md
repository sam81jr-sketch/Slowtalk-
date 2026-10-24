# SlowTalk 2.0

Private two-person rooms with invitation links, real-time text chat, and optional WebRTC voice/video calls.

## Run in Termux

Do not install npm packages inside Android shared storage (`/storage/emulated/0/Download`), because npm needs symlinks. Keep the project in Termux's private home directory.

```bash
pkg update
pkg install nodejs-lts unzip
cd ~/storage/downloads
unzip SlowTalk_Webpage_v2.zip
cp -r SlowTalk ~/SlowTalk
cd ~/SlowTalk
npm install
npm start
```

Open `http://localhost:3000` on the same phone. If `~/SlowTalk` already exists, remove it first with `rm -rf ~/SlowTalk` before copying the new folder.

## Use over the internet

This project is not publicly hosted by default. Deploy it to a Node.js host that supports WebSockets and HTTPS. Both users must open the same public HTTPS URL. `localhost` only works on the device running the server.

The app uses a public STUN server; some networks need a TURN relay for reliable voice/video. Add TURN configuration to the `iceServers` setting in `public/index.html` if needed. Do not publish TURN credentials in a public repository.

## Privacy and limitations

- Random invitation links act like keys. Anyone who gets a link can attempt to join, so share it privately.
- Rooms allow at most two connected users.
- Chat history is not saved by this starter app; messages are relayed through the server.
- WebRTC media is peer-to-peer when possible, but some networks require a relay.
- Public hosting must use HTTPS for camera/microphone permissions.
- No accounts, room password, or security audit are included. This is a starter project, not a secure messenger for sensitive information.
