const socket = io();
const peer = new Peer();

let localStream;
let isMuted = false;
let analyser;
let bufferLength;
let dataArray;
const waveCanvas = document.getElementById("waveCanvas");
const waveCtx = waveCanvas.getContext("2d");

// Get user media (audio only)
navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
        // Show local audio (you can also hide it if it's only for sending)
        const myAudio = document.createElement("audio");
        myAudio.srcObject = stream;
        document.body.appendChild(myAudio); // For testing, remove if unnecessary
        localStream = stream;

        // Initialize audio visualizer
        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Adjust this value for more or less detail
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Visualize the waveform
        function drawWaveform() {
            requestAnimationFrame(drawWaveform);
            analyser.getByteFrequencyData(dataArray);

            waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
            waveCtx.fillStyle = "rgb(0, 255, 0)";
            let barWidth = waveCanvas.width / bufferLength;
            for (let i = 0; i < bufferLength; i++) {
                let barHeight = dataArray[i];
                waveCtx.fillRect(
                    i * barWidth,
                    waveCanvas.height - barHeight,
                    barWidth,
                    barHeight
                );
            }
        }

        drawWaveform();

        // When someone calls, answer with your stream
        peer.on("call", (call) => {
            call.answer(stream); // Answer the call with your stream

            // Receive incoming audio stream from the peer
            call.on("stream", (remoteStream) => {
                const peerAudio = document.createElement("audio");
                peerAudio.srcObject = remoteStream;
                document.body.appendChild(peerAudio); // For testing, remove if unnecessary
            });
        });
    })
    .catch((err) => console.error("Error accessing media devices:", err));

// Emit join room event
socket.emit("joinRoom", "<%= locals.roomId %>");

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-c++src", // C++ mode
    theme: "dracula", // Dracula theme
    lineNumbers: true, // Show line numbers
    autoCloseBrackets: true, // Auto-close brackets
});

// Set editor size
editor.setSize("100%", "500px");

let isUpdating = false;

// Detect content changes and emit codeChange event
editor.on("change", function () {
    if (!isUpdating) {
        socket.emit("codeChange", {
            roomId: "<%= locals.roomId %>",
            code: editor.getValue(),
        });
    }
});

// Listen for code updates from server
socket.on("codeUpdate", function (data) {
    if (data.roomId === "<%= locals.roomId %>") {
        isUpdating = true;
        editor.setValue(data.code);
        isUpdating = false;
    }
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Link copied to clipboard!");
    });
}

const option = document.getElementById("inlineFormCustomSelect");
option.addEventListener("change", () => {
    if (option.value == "Java") {
        editor.setOption("mode", "text/x-java");
    } else if (option.value == "Python") {
        editor.setOption("mode", "text/x-python");
    } else {
        editor.setOption("mode", "text/x-c++src");
    }
});

const input = document.getElementById("input");
const output = document.getElementById("output");
const run = document.getElementById("run");
let code;
run.addEventListener("click", async () => {
    code = {
        code: editor.getValue(),
        input: input.value,
        lang: option.value,
    };
    const response = await fetch("http://localhost:8000/compile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(code),
    });

    const result = await response.json();
    output.value = result.output;
});

document.getElementById("muteBtn").addEventListener("click", () => {
    isMuted = !isMuted;

    if (isMuted) {
        localStream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = false; // Mute the audio track
            }
        });
        document.getElementById("muteBtn").innerText = "Unmute"; // Change button text
    } else {
        localStream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = true; // Unmute the audio track
            }
        });
        document.getElementById("muteBtn").innerText = "Mute"; // Change button text
    }
});
socket.on("disconnect", () => {
    console.log("User disconnected");
    peer.destroy();
});
