const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
];

class WebRTCPeer {
    constructor(socket, targetId, onMessage, onStatusChange) {
        this.socket = socket;
        this.targetId = targetId;
        this.onMessage = onMessage;
        this.onStatusChange = onStatusChange;

        this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.dataChannel = null;

        this.setupPC();
    }

    setupPC() {
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('webrtc_ice_candidate', {
                    target: this.targetId,
                    candidate: event.candidate
                });
            }
        };

        this.pc.onconnectionstatechange = () => {
            console.log(`[WebRTC] Peer ${this.targetId} connection state:`, this.pc.connectionState);
            if (this.onStatusChange) this.onStatusChange(this.pc.connectionState);
        };

        this.pc.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };
    }

    setupDataChannel(channel) {
        this.dataChannel = channel;
        this.dataChannel.onopen = () => {
            console.log(`[WebRTC] Data channel with ${this.targetId} is OPEN`);
        };
        this.dataChannel.onmessage = (event) => {
            if (this.onMessage) this.onMessage(this.targetId, JSON.parse(event.data));
        };
        this.dataChannel.onclose = () => {
            console.log(`[WebRTC] Data channel with ${this.targetId} is CLOSED`);
        };
    }

    async createOffer() {
        this.dataChannel = this.pc.createDataChannel('locallink');
        this.setupDataChannel(this.dataChannel);

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        this.socket.emit('webrtc_offer', {
            target: this.targetId,
            offer
        });
    }

    async handleOffer(offer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        this.socket.emit('webrtc_answer', {
            target: this.targetId,
            answer
        });
    }

    async handleAnswer(answer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleCandidate(candidate) {
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('[WebRTC] Error adding received ice candidate', e);
        }
    }

    send(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    close() {
        if (this.dataChannel) this.dataChannel.close();
        this.pc.close();
    }
}

export default WebRTCPeer;
