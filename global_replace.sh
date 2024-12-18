#!/bin/bash

# Find and replace .tsx extensions in imports
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f -name "*.tsx" -print0 | xargs -0 sed -i '' 's/from '"'"'\.\.\/hooks\/useAuth\.tsx'"'"'/from '"'"'\.\.\/hooks\/useAuth'"'"'/g'

# Replace user with currentUser in imports and destructuring
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f -name "*.tsx" -print0 | xargs -0 sed -i '' 's/const { user }/const { currentUser }/g'
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f -name "*.tsx" -print0 | xargs -0 sed -i '' 's/user:/currentUser:/g'

# Remove any unused imports or variables with underscore prefix
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f -name "*.tsx" -print0 | xargs -0 sed -i '' '/const \[_/d'
find /Users/psrinivas/Desktop/Skill\ Swap/src -type f -name "*.tsx" -print0 | xargs -0 sed -i '' '/_signOut/d'

echo "Global replacements complete!"
