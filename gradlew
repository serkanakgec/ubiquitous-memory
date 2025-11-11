#!/usr/bin/env bash

#
# Copyright 2015 the original author or authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass any JVM options to Gradle and Java applications respectively.
DEFAULT_JVM_OPTS=""

APP_NAME="Gradle"
APP_BASE_NAME=$(basename "$0")

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD="maximum"

warn () {
    echo "$*"
}

die () {
    echo
    echo "ERROR: $*"
    echo
    exit 1
}

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "$(uname)" in
  CYGWIN* )
    cygwin=true
    ;;
  Darwin* )
    darwin=true
    ;;
  MINGW* )
    msys=true
    ;;
  NONSTOP* )
    nonstop=true
    ;;
esac

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
PRG="$0"
# Need this for relative symlinks.
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=`dirname "$PRG"`"/$link"
    fi
done
APP_HOME=`dirname "$PRG"`

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Increase the maximum file descriptors if we can.
if [ "$cygwin" = "false" -a "$darwin" = "false" -a "$nonstop" = "false" ] ; then
    MAX_FD_LIMIT=$(ulimit -H -n)
    if [ $? -eq 0 ] ; then
        if [ "$MAX_FD" = "maximum" -o "$MAX_FD" = "max" ] ; then
            # Use the system limit
            MAX_FD="$MAX_FD_LIMIT"
        fi
        ulimit -n "$MAX_FD"
        if [ $? -ne 0 ] ; then
            warn "Could not set maximum file descriptor limit: $MAX_FD"
        fi
    else
        warn "Could not query maximum file descriptor limit: $MAX_FD_LIMIT"
    fi
fi

# Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass any JVM options to Gradle and Java applications respectively.
DEFAULT_JVM_OPTS=""

# For Darwin, add options to specify how the application appears in the dock
if $darwin; then
    GRADLE_OPTS="$GRADLE_OPTS \"-Xdock:name=$APP_NAME\" \"-Xdock:icon=$APP_HOME/media/gradle.icns\""
fi

# For Cygwin, switch paths to Windows format before running java
if $cygwin ; then
    APP_HOME=$(cygpath --path --windows "$APP_HOME")
    CLASSPATH=$(cygpath --path --windows "$CLASSPATH")
    CYGWIN_OPTS=$(cygpath --path --windows "$CYGWIN_OPTS")
fi

# Determine the Gradle wrapper JAR
WRAPPER_JAR="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

# Escape the arguments for the new invocation
for i in "$@" ; do
    i="${i//\\/\\\\}"
    i="${i// /\\ }"
    i="${i//\"/\\\"}"
    i="${i//\`/\\\`}"
    i="${i//\$/\\\$}"
    i="${i//\(/\\(}"
    i="${i//\)/\\)}"
    eval "arguments=\"$arguments '$i'\""
done

# Collect all arguments for the java command, following the shell quoting and substitution rules
eval set -- "$@"

# Use reasonable defaults for the JVM
if [ -z "$JAVA_OPTS" ] ; then
    if $("$JAVACMD" -version 2>&1 | grep "OpenJDK" > /dev/null) ; then
        if $("$JAVACMD" -version 2>&1 | grep "1.8." > /dev/null) ; then
            # For Java 8, the following options are recommended:
            # See https://github.com/gradle/gradle/issues/1321
            # See https://github.com/gradle/gradle/issues/1322
            DEFAULT_JVM_OPTS="-XX:MaxMetaspaceSize=256m"
        fi
    fi
fi

exec "$JAVACMD" "${DEFAULT_JVM_OPTS}" "${JAVA_OPTS}" "${GRADLE_OPTS}" -jar "$WRAPPER_JAR" $arguments
