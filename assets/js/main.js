const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const cd = $('.cd');
const playlist = $('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');


console.log(player);

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Kakurenbo',
            singer: 'AliA',
            path: './assets/music/song_1.mp3',
            image: './assets/img/song_1.jpg'
        },
        {
            name: 'Yuke',
            singer: 'LiSA',
            path: './assets/music/song_2.mp3',
            image: './assets/img/song_2.jpg'
        },
        {
            name: 'Scarborough Fair',
            singer: 'Unknown',
            path: './assets/music/song_3.mp3',
            image: './assets/img/song_3.jpg'
        },
        {
            name: 'Wait For You',
            singer: '4D ft. 8utterfly',
            path: './assets/music/song_4.mp3',
            image: './assets/img/song_4.jpg'
        },
        {
            name: 'Byakuya',
            singer: 'Reol',
            path: './assets/music/song_5.mp3',
            image: './assets/img/song_5.jpg'
        },
        {
            name: 'Be...',
            singer: 'Mr.OJJA',
            path: './assets/music/song_6.mp3',
            image: './assets/img/song_6.jpg'
        },
        {
            name: 'Hoshi To Kimi Ga kieta Hi',
            singer: 'HI3',
            path: './assets/music/song_7.mp3',
            image: './assets/img/song_7.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function (){
        const htmls = this.songs.map((song, index)=> {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
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
            `
        })
        playlist.innerHTML = htmls.join('\n');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xu li CD xoay / dung
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        console.log(cdThumbAnimate);
        // Xu li phong to / thu nho CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xu li khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }else{                
                audio.play();                
            };
        }

        // Khi song duoc play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bi pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // The hien tien do bai hat thay doi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xu li khi tua song
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Xu li khi next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xu li khi next song
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xu li khi on / off random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);           
        }

        // Xu li khi lap lai song
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        },

        // Xu li next song khi song ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            };
        },

        // Lang nghe hanh dong click vao playlist
        playlist.onclick = function(e){
            const songElement = e.target.closest('.song:not(.active)');
            if(songElement || e.target.closest('.option')){
                // Xu li khi click vao song
                if(songElement){
                    _this.currentIndex = Number(songElement.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xu li khi click vao song option
            }
        }

    },
    scrollToActiveSong: function(){
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 500);
    },

    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex > this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function(){
        // Gan cau hinh tu config vao ung dung
        this.loadConfig();

        // Dinh nghia cac thuoc tinh cho object
        this.defineProperties();

        // Lang nghe/ xu ly cac event
        this.handleEvents();

        // Tai ca thong tin bai hat vao UI khi chay ung dung
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Tai cac tuy chinh phat song
        randomBtn.classList.toggle('active', this.isRandom);  
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
}

app.start();

// Progress lesson 1:09:00