#!/bin/bash

# Replace Firebase auth.currentUser references
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/const user = auth\.currentUser/const currentUser = auth.currentUser/g'
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/user\.uid/currentUser.uid/g'
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/user\.email/currentUser.email/g'
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/user\.displayName/currentUser.displayName/g'

# Replace other user references in specific contexts
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/\(match\.user\.\)\(uid\|displayName\)/match.currentUser.\2/g'

echo "User reference replacements complete!"
