#!/bin/bash

# Start Firebase emulator in the background
firebase emulators:start --only firestore &
EMULATOR_PID=$!

# Wait for emulator to start
sleep 5

# Run Firestore rules tests
npm run test:firestore-rules

# Capture test result
TEST_RESULT=$?

# Kill the emulator
kill $EMULATOR_PID

# Exit with test result
exit $TEST_RESULT
