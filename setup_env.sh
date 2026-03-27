#!/bin/bash

# Default paths
DEFAULT_ANDROID_HOME="$HOME/Android/Sdk"
DEFAULT_JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64" # Common path for openjdk-17

# Check for ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$DEFAULT_ANDROID_HOME" ]; then
        echo "Found Android SDK at $DEFAULT_ANDROID_HOME"
        export ANDROID_HOME="$DEFAULT_ANDROID_HOME"
        export PATH=$PATH:$ANDROID_HOME/platform-tools
        export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
    else
        echo "⚠️  ANDROID_HOME not set and not found in default location ($DEFAULT_ANDROID_HOME)."
        echo "Please set ANDROID_HOME manually."
    fi
else
    echo "✅ ANDROID_HOME is set to $ANDROID_HOME"
fi

# Check for JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    if [ -d "$DEFAULT_JAVA_HOME" ]; then
        echo "Found Java 17 at $DEFAULT_JAVA_HOME"
        export JAVA_HOME="$DEFAULT_JAVA_HOME"
        export PATH=$PATH:$JAVA_HOME/bin
    else
        # Try to find java path via 'which'
        JAVA_BIN=$(which java)
        if [ ! -z "$JAVA_BIN" ]; then
             echo "Found java in PATH: $JAVA_BIN"
             # Simplified effort to find home, might need adjustment
        else
             echo "⚠️  JAVA_HOME not set and 'java' not found in PATH."
        fi
    fi
else
    echo "✅ JAVA_HOME is set to $JAVA_HOME"
fi

# Verification
echo "--- Environment Verification ---"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "JAVA_HOME: $JAVA_HOME"

if command -v adb &> /dev/null; then
    echo "✅ adb found: $(which adb)"
else
    echo "❌ adb not found"
fi

if command -v java &> /dev/null; then
    echo "✅ java found: $(java -version 2>&1 | head -n 1)"
else
    echo "❌ java not found"
fi
