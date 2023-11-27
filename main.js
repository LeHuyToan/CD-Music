const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PlAYER_STORAGE_KEY = 'LHT_PLAYER'
const player = $('.player')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const cd = $('.cd')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},


    songs: [{
            name: 'Ánh sao và bầu trời',
            singer: 'T.R.I x Cá',
            path: './assets/music/song1.mp3',
            image: './assets/img/1.jpg',
        },
        {
            name: 'Bạn đời',
            singer: 'Karik x Gducky',
            path: './assets/music/song2.mp3',
            image: './assets/img/2.jpg',
        },
        {
            name: 'Góc trời của nàng',
            singer: 'Lý Bực',
            path: './assets/music/song3.mp3',
            image: './assets/img/3.jpg',
        },
        {
            name: 'Khi mà',
            singer: 'RONBOOGZ',
            path: './assets/music/song4.mp3',
            image: './assets/img/4.jpg',
        },
        {
            name: 'Lan man',
            singer: 'RONBOOGZ',
            path: './assets/music/song5.mp3',
            image: './assets/img/5.jpg',
        },
        {
            name: 'Nụ hôn Bi-su',
            singer: 'Mikelodic',
            path: './assets/music/song6.mp3',
            image: './assets/img/6.jpg',
        },
        {
            name: 'Từng quen',
            singer: 'Wren Evans',
            path: './assets/music/song7.mp3',
            image: './assets/img/7.jpg',
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" :""}"  data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {

        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, //10s
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        //Xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử  lý khi click play

        playBtn.onclick = function() {
            if (app.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // khi song play
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // khi song pause
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua 
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //khi next song
        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.nextSong()

            }
            audio.play() //TH đag chạy thì next bài
            app.render()
            app.scrollToActiveSong()
        }

        //khi prev song
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.prevSong()
            }
            audio.play() //TH đag chạy thì next bài
            app.render()
            app.scrollToActiveSong()

        }

        //Xử lý random bật/tắt radom song 
        randomBtn.onclick = function(e) {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle("active", app.isRandom)
        }

        //Xử lý lặp lại song
        repeatBtn.onclick = function(e) {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle("active", app.isRepeat)
        }

        //Xử lý next song sau khi audio end
        audio.onended = function() {
            if (app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe click vào playlist

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                console.log(e.target)
                    //xử lý khi click vào song
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    app.render()
                    audio.play()
                }

                //Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }


    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()
    },


    prevSong: function() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex == this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()

    },
    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
            //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy sử dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();

        //hiển thị trạng thái ban đầu của btn repeat & random
        randomBtn.classList.toggle("active", this.isRandom)
        repeatBtn.classList.toggle("active", this.isRepeat)
    }
};
app.start();