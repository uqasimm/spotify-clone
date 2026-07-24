console.log("Hey!");

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/Songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }

    return songs;
}

async function main() {
    let songs = await getSongs();
    console.log(songs);

    var audio = new Audio(songs[0]);

    let playBtn = document.querySelector(".play-button");
    playBtn.addEventListener(("click"), () => {

        if (audio.paused) {
            audio.play()
            playBtn.src = "Resources/pause.svg"
        }
        else {
            playBtn.src = "Resources/song-play.svg"
            audio.pause()
        }
    })
}

main()