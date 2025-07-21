#!/bin/bash
cd /home/kavia/workspace/code-generation/global-time-viewer-09eb3155/frontend_reactjs
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

