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

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const paddedSeconds = String(seconds).padStart(2, '0');

    return `${minutes}:${paddedSeconds}`
};

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

function scrollRow(scrollOffset) {
    const container = document.querySelector('card-container');
    container.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
    });
}

async function main() {
    let { songs, images } = await getSongs();
    let cardContainer = document.querySelector(".card-container");
    let playBtn = document.querySelector(".play-button");
    let nextBtn = document.querySelector(".next-button")
    let prevBtn = document.querySelector(".prev-button")

    let scrollPrev = document.querySelector(".scroll-button.prev");
    let scrollNext = document.querySelector(".scroll-button.next");

    scrollPrev.addEventListener("click", () => {
        cardContainer.scrollBy({ left: -300, behavior: "smooth" });
    });

    scrollNext.addEventListener("click", () => {
        cardContainer.scrollBy({ left: 300, behavior: "smooth" });
    });

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

    nextBtn.addEventListener(("click"), () => {
        
    })

    currentAudio.addEventListener(("timeupdate"), () => {
        let currentTimeFormatted = formatTime(currentAudio.currentTime)
        let durationFormatted = isNaN(currentAudio.duration) ? "0:00" : formatTime(currentAudio.duration);

        document.querySelector(".song-time").innerHTML = `${currentTimeFormatted} / ${durationFormatted}`;

        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%"
    })

    currentAudio.addEventListener(("ended"), () => {
        currentAudio.currentTime = 0;
        playBtn.src = "Resources/song-play.svg";

        let durationFormatted = isNaN(currentAudio.duration) ? "0:00" : formatTime(currentAudio.duration);
        document.querySelector(".song-time").innerHTML = `0:00 / ${durationFormatted}`;
    })

    document.querySelector(".seekbar").addEventListener(("click"), (e) => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentAudio.currentTime = (currentAudio.duration * percent) / 100
    })

}

main();