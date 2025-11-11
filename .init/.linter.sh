#!/bin/bash
cd /home/kavia/workspace/code-generation/reese-turnover-predictor-185677-185686/turnover_predictor_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

