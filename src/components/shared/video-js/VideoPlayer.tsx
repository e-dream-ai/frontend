import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';


// testing video player
const VideoPlayer = () => {
    const mainVideoRef = useRef<HTMLDivElement>(null);
    const fadeVideoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // video sources
    const sources = [
        'https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/da14db51-59b1-4592-85e8-d24c749eabc8/7d42578e-15c7-435f-b0b1-369c8959b54a/7d42578e-15c7-435f-b0b1-369c8959b54a_processed.mp4',
        'https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/da14db51-59b1-4592-85e8-d24c749eabc8/00254001-5889-4f9d-aa1e-fb56da20ba60/00254001-5889-4f9d-aa1e-fb56da20ba60_processed.mp4',
        'https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/92e1c95c-031f-46b8-ab7e-b67b52423828/6c8912dd-0f5c-45e3-9284-60a96bf630b7/6c8912dd-0f5c-45e3-9284-60a96bf630b7_processed.mp4',
    ]

    useEffect(() => {
        if (!mainVideoRef.current) return;

        // initialize videojs instance
        const player = videojs(mainVideoRef.current, {
            controls: true,
            fluid: true,
            preload: 'auto'
        });

        playerRef.current = player;

        // set initial video
        player.src(sources[0]);

        // Style the fade video
        if (fadeVideoRef.current) {
            fadeVideoRef.current.style.position = 'absolute';
            fadeVideoRef.current.style.opacity = '0';
            fadeVideoRef.current.style.transition = 'opacity 500ms ease';
        }

        // add click handler to play video
        const videoContainer = player.el();
        videoContainer.onclick = handleVideoClick;

        // cleanup
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
            }
        };
    }, []);

    const handleVideoClick = () => {
        if (playerRef.current) {
            if (playerRef.current.paused()) {
                playerRef.current.play();
            } else {
                playerRef.current.pause();
            }
        }
    };

    // handle crossfade fn
    const handleCrossfade = async (newIndex: number) => {

        console.log({ fadeVideoRef, playerRef });
        if (!fadeVideoRef.current || !playerRef.current) return;

        try {
            const wasPlaying = !playerRef.current.paused();

            // prepare the fade video
            fadeVideoRef.current.src = sources[newIndex];

            // wait for video ready
            await new Promise((resolve) => {
                fadeVideoRef.current.oncanplay = resolve;
            });

            if (wasPlaying) {
                // start playing the fade video only if the main video was playing
                await fadeVideoRef.current.play();
            }

            // fade it in
            fadeVideoRef.current.style.opacity = '1';

            // after fade completes
            setTimeout(async () => {
                // set new source
                playerRef.current?.src(sources[newIndex]);

                if (wasPlaying) {
                    try {
                        await playerRef.current.play();
                    } catch (error) {
                        console.log('Playback error:', error);
                    }
                }

                // hide fade video
                fadeVideoRef.current.style.opacity = '0';

                // clear fade video
                setTimeout(() => {
                    fadeVideoRef.current.src = '';
                }, 100);
            }, 500);

            setCurrentIndex(newIndex);
        } catch (error) { }
    };

    const playNext = () => {
        const nextIndex = (currentIndex + 1) % sources.length;
        handleCrossfade(nextIndex);
    };

    const playPrevious = () => {
        const prevIndex = (currentIndex - 1 + sources.length) % sources.length;
        handleCrossfade(prevIndex);
    };

    return (
        <div>
            <div data-vjs-player style={{ position: 'relative' }}>
                <video
                    ref={mainVideoRef}
                    className="video-js vjs-big-play-centered vjs-fluid w-full"
                />
                <video
                    ref={fadeVideoRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1
                    }}
                />
            </div>
            <div>
                <button onClick={playPrevious}>Prev</button>
                <button onClick={playNext}>Next</button>
            </div>
        </div>
    );
};

export default VideoPlayer;