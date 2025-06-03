#!/bin/bash

# Create sounds directory if it doesn't exist
mkdir -p src/assets/sounds

# Download move sounds (short, crisp sounds)
curl -L "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" -o src/assets/sounds/move-x.mp3
curl -L "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3" -o src/assets/sounds/move-o.mp3

# Download board win sound (short victory sound)
curl -L "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3" -o src/assets/sounds/board-win.mp3

# Download game win sound (applause)
curl -L "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" -o src/assets/sounds/game-win.mp3

echo "Sound files downloaded successfully!" 