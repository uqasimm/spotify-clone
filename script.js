let currentAudio = new Audio();
let currentSongUrl = "";

function parseSongDetails(songUrl) {
    let rawFilename = songUrl.split("/").pop().replace(/\.mp3$/i, "");

    if (rawFilename.includes("_")) {
        let [titlePart, artistPart] = rawFilename.split("_");
        return {
            title: titlePart.replace(/-/g, " "),
            artist: artistPart.replace(/-/g, " ")
        };
    }

    return {
        title: rawFilename.replace(/-/g, " "),
        artist: "Unknown Artist"
    };
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/Songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    let images = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = decodeURIComponent(element.href).replace(/\\/g, "/");

        if (href.endsWith(".mp3")) {
            songs.push(href);
        } else if (href.match(/\.(jpg|jpeg|png|webp)$/i)) {
            images.push(href);
        }
    }

    return { songs, images };
}

const playMusic = (trackUrl) => {
    let playBtn = document.querySelector(".play-button");
    let songInfo = document.querySelector(".song-info");

    if (currentSongUrl !== trackUrl) {
        currentAudio.src = trackUrl;
        currentSongUrl = trackUrl;
        currentAudio.play();
        playBtn.src = "Resources/pause.svg";

        if (songInfo) {
            let { title } = parseSongDetails(trackUrl);
            songInfo.innerText = title;
        }
    } else {
        if (currentAudio.paused) {
            currentAudio.play();
            playBtn.src = "Resources/pause.svg";
        } else {
            currentAudio.pause();
            playBtn.src = "Resources/song-play.svg";
        }
    }
};

async function main() {
    let { songs, images } = await getSongs();
    let cardContainer = document.querySelector(".card-container");
    let playBtn = document.querySelector(".play-button");

    cardContainer.innerHTML = "";

    songs.forEach((songUrl) => {
        let { title, artist } = parseSongDetails(songUrl);

        let fullSongFileName = songUrl.split("/").pop().replace(/\.mp3$/i, "");

        let baseSongName = fullSongFileName.split("_")[0];

        let matchingImage = images.find(imgUrl => {
            let baseImgName = imgUrl.split("/").pop().replace(/\.(jpg|jpeg|png|webp)$/i, "");
            return baseImgName === fullSongFileName || baseImgName === baseSongName;
        });

        let coverUrl = matchingImage ? matchingImage : "https://via.placeholder.com/150";

        cardContainer.innerHTML += `
           <div class="card" data-url="${songUrl}">
                <div class="play">
                    <img src="Resources/play.svg" alt="play">
                </div>
                <img src="${coverUrl}" alt="${title}">
                <h3>${title}</h3>
                <div class="artist">${artist}</div>
            </div>
        `;
    });

    let cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            let trackUrl = card.dataset.url;
            playMusic(trackUrl);
        });
    });

    playBtn.addEventListener("click", () => {
        if (!currentAudio.src && songs.length > 0) {
            playMusic(songs[0]);
        } else if (currentAudio.paused) {
            currentAudio.play();
            playBtn.src = "Resources/pause.svg";
        } else {
            currentAudio.pause();
            playBtn.src = "Resources/song-play.svg";
        }
    });
}

main();