//META{"name":"discordCrypt"}*//

/*@cc_on
@if (@_jscript)
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    shell.Popup("It looks like you mistakenly tried to run me directly. (don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else @*/

/*******************************************************************************
 * MIT License
 *
 * Copyright (c) 2018 Leonardo Gates
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/

"use strict";

/**
 * @typedef {Object} ModulePredicate
 * @desc Predicate for searching module.
 * @property {*} module Module to test.
 * @return {boolean} Returns `true` if `module` matches predicate.
 */

/**
 * @typedef {Object} WebpackFinder
 * @property {Object} module The module object.
 */

/**
 * @typedef {Object} WebpackPrototypeFinder
 * @property {string[]} prototypes All prototypes to search for.
 */

/**
 * @typedef {Object} WebpackPropertyFinder
 * @property {string[]} properties All properties to search for.
 */

/**
 * @typedef {Object} WebpackDisplayNameFinder
 * @property {string} displayName The display name to search for.
 */

/**
 * @typedef {Object} WebpackModuleIdFinder
 * @property {int} id The ID to locate.
 */

/**
 * @typedef {Object} WebpackDispatchFinder
 * @property {string[]} dispatchNames All dispatch names to search for.
 */

/**
 * @typedef {Object} WebpackModuleSearcher
 * @desc Returns various functions that can scan for webpack modules.
 * @property {WebpackFinder} find Recursively iterates all webpack modules to the callback function.
 * @property {WebpackPrototypeFinder} findByUniquePrototypes Iterates all modules looking for the defined prototypes.
 * @property {WebpackPropertyFinder} findByUniqueProperties Iterates all modules look for the defined properties.
 * @property {WebpackDisplayNameFinder} findByDisplayName Iterates all modules looking for the specified display name.
 * @property {WebpackModuleIdFinder} findByDispatchToken Iterates all modules looking for the dispatch token by its ID.
 * @property {WebpackDispatchFinder} findByDispatchNames Iterates all modules looking for the specified dispatch names.
 */

/**
 * @typedef {Object} CachedModules
 * @desc Cached Webpack modules for internal access.
 * @property {Object} NonceGenerator Internal nonce generator used for generating unique IDs from the current time.
 * @property {Object} ChannelStore Internal channel resolver for retrieving a list of all channels available.
 * @property {Object} GlobalTypes Internal message action types and constants for events.
 * @property {Object} GuildStore Internal Guild resolver for retrieving a list of all guilds currently in.
 * @property {Object} MessageCreator Internal message parser that's used to translate tags to Discord symbols.
 * @property {Object} MessageController Internal message controller used to receive, send and delete messages.
 * @property {Object} EventDispatcher Internal message dispatcher for pending queued messages.
 * @property {Object} MessageQueue Internal message Queue store for pending parsing.
 * @property {Object} UserStore Internal user resolver for retrieving all users known.
 */

/**
 * @typedef {Object} TimedMessage
 * @desc Contains a timed message pending deletion.
 * @property {string} messageId The identification tag of the timed message.
 * @property {string} channelId The channel's identifier that this message was sent to.
 * @property {Date} expireTime The time to purge the message from the channel.
 */

/**
 * @typedef {Object} PublicKeyInfo
 * @desc Contains information given an input public key.
 * @property {number} index The index of the exchange algorithm.
 * @property {string} fingerprint The SHA-256 sum of the public key.
 * @property {string} algorithm The public key's type ( DH | ECDH ) extracted from the metadata.
 * @property {int} bit_length The length, in bits, of the public key's security.
 * @property {Buffer} salt The unique salt for this key.
 * @property {Buffer} key The raw key.
 */

/**
 * @typedef {Object} UpdateInfo
 * @desc Contains information regarding a blacklisted update.
 * @property {string} version Reported version of the blacklisted update.
 * @property {string} payload The raw update payload.
 * @property {boolean} valid The signature was marked as valid.
 * @property {string} hash Checksum of the update data.
 * @property {string} signature The signed PGP signature for the update payload.
 * @property {string} changelog Reported changes that occurred during this update.
 */

/**
 * @typedef {Object} ChannelStore
 * @desc Storage information settings relating to the channel.
 * @property {string} [primaryKey] Primary encryption key.
 * @property {string} [secondaryKey] Secondary encryption key.
 * @property {string[]} ignoreIds Message IDs to exclude from parsing.
 * @property {boolean} autoEncrypt Whether to automatically encrypt messages.
 */

/**
 * @typedef {Object} ChannelInfo
 * @desc Contains settings regarding all channels.
 * @property {string} channelId Channel's specific ID number.
 * @property {ChannelStore} store Individual storage for this channel.
 */

/**
 * @typedef {Object} Config
 * @desc Contains the configuration data used for the plugin.
 * @property {string} version The version of the configuration.
 * @property {string} defaultPassword The default key to encrypt or decrypt message with, if not specifically defined.
 * @property {string} decryptedPrefix The string that should be prepended to messages that have been decrypted.
 * @property {string} encodeMessageTrigger The suffix trigger which, once appended to the message,
 *      forces encryption even if a key is not specifically defined for this channel.
 * @property {number} encryptMode The index of the ciphers to use for message encryption.
 * @property {string} encryptBlockMode The block operation mode of the ciphers used to encrypt message.
 * @property {number} exchangeBitSize The size in bits of the exchange algorithm to use.
 * @property {string} paddingMode Padding scheme to used to align all messages to the cipher's block length.
 * @property {string} up1Host The full URI host of the Up1 service to use for encrypted file uploads.
 * @property {string} up1ApiKey If specified, contains the API key used for authentication with the up1Host.
 * @property {Array<TimedMessage>} timedMessages Contains all logged timed messages pending deletion.
 * @property {number} timedMessageExpires How long after a message is sent should it be deleted in seconds.
 * @property {boolean} automaticUpdates Whether to automatically check for updates.
 * @property {boolean} autoAcceptKeyExchanges Whether to automatically accept incoming key exchange requests.
 * @property {Array<UpdateInfo>} blacklistedUpdates Updates to ignore due to being blacklisted.
 * @property {ChannelInfo} channels Specific data per channel.
 */

/**
 * @typedef {Object} UpdateCallback
 * @desc The function to execute after an update has been retrieved or if an error occurs.
 * @property {UpdateInfo} [info] The update's information if valid.
 */

/**
 * @typedef {Object} GetResultCallback
 * @desc The function to execute at the end of a GET request containing the result or error that occurred.
 * @property {int} statusCode The HTTP static code of the operation.
 * @property {string|null} The HTTP error string if an error occurred.
 * @property {string} data The returned data from the request.
 * @return {boolean} Returns true if the data was parsed successfully.
 */

/**
 * @typedef {Object} PBKDF2Callback
 * @desc The function to execute after an async request for PBKDF2 is completed containing the result or error.
 * @property {string} error The error that occurred during processing or null on success.
 * @property {string} hash The hash either as a hex or Base64 encoded string ( or null on failure ).
 */

/**
 * @typedef {Object} EncryptedFileCallback
 * @desc The function to execute when a file has finished being encrypted.
 * @property {string} error_string The error that occurred during operation or null if no error occurred.
 * @property {Buffer} encrypted_data The resulting encrypted buffer as a Buffer() object.
 * @property {string} identity The encoded identity of the encrypted file.
 * @property {string} seed The initial seed used to decrypt the encryption keys of the file.
 */

/**
 * @typedef {Object} UploadedFileCallback
 * @desc The function to execute after a file has been uploaded to an Up1 service.
 * @property {string} error_string The error that occurred or null if no error occurred.
 * @property {string} file_url The URL of the uploaded file/
 * @property {string} deletion_link The link used to delete the file.
 * @property {string} encoded_seed The encoded encryption key used to decrypt the file.
 */

/**
 * @typedef {Object} ScryptCallback
 * @desc The function to execute for Scrypt based status updates.
 *      The function must return false repeatedly upon each call to have Scrypt continue running.
 *      Once [progress] === 1.f AND [key] is defined, no further calls will be made.
 * @property {string} error The error message encountered or null.
 * @property {real} progress The percentage of the operation completed. This ranges from [ 0.00 - 1.00 ].
 * @property {Buffer} result The output result when completed or null if not completed.
 * @returns {boolean} Returns false if the operation is to continue running or true if the cancel the running
 *      operation.
 */

/**
 * @typedef {Object} HashCallback
 * @desc The function to execute once the hash is calculated or an error has occurred.
 * @property {string} error The error that occurred or null.
 * @property {string} hash The hex or Base64 encoded result.
 */

/**
 * @typedef {Object} ClipboardInfo
 * @desc Contains extracted data from the current clipboard.
 * @property {string} mime_type The MIME type of the extracted data.
 * @property {string|null} name The name of the file, if a file was contained in the clipboard.
 * @property {Buffer|null} data The raw data contained in the clipboard as a Buffer.
 */

/**
 * @typedef {Object} UserMention
 * @desc Contains a user-specific mention.
 * @property {string} avatar The user's avatar hash.
 * @property {string} discriminator The user's 4-digit discriminator.
 * @property {string} id The user's unique identification number.
 * @property {string} username The user's account name. ( Not display name. )
 */

/**
 * @typedef {Object} MessageMentions
 * @desc Contains information on what things were mentioned in a message.
 * @property {boolean} mention_everyone Whether "@everyone" was used in the message.
 * @property {Array<UserMention>} mentions Contains all user IDs mentioned in a message.
 * @property {Array<string>} mention_roles Roles that were mentioned.
 */

/**
 * @typedef {Object} LibraryInfo
 * @desc Contains the library and necessary information.
 * @property {boolean} requiresNode Whether this library relies on NodeJS internal support.
 * @property {boolean} requiresBrowser Whether this library is meant to be run in a browser.
 * @property {string} code The raw code for execution defined in the library.
 */

/**
 * @typedef {Object} LibraryDefinition
 * @desc Contains a definition of a raw library executed upon plugin startup.
 * @property {string} name The name of the library file.
 * @property {LibraryInfo} info The library info.
 */

/**
 * @typedef {Object} MessageAuthor
 * @desc The author of a message.
 * @property {string} avatar The hash name of the user's avatar.
 * @property {string} discriminator The 4-digit discriminator value for this user.
 * @property {string} id The snowflake ID for the user.
 * @property {string} username The name of the user.
 */

/**
 * @typedef {Object} MemberInfo
 * @desc The author of a message.
 * @property {boolean} deaf Whether this user has been deafened.
 * @property {string} joined_at The time the user joined
 * @property {boolean} mute Whether the user is muted.
 * @property {string} [nick] The nickname of the user, if any.
 */

/**
 * @typedef {Object} EmbedFooter
 * @property {string} [text] Footer text.
 * @property {string} [icon_url] URL of the footer icon.
 * @property {string} [proxy_icon_url] Alternative URL of the footer icon.
 */

/**
 * @typedef {Object} EmbedImage
 * @property {string} [url] Source url of the image. ( HTTPS links. )
 * @property {string} [proxy_url] Alternative URL to the image.
 * @property {number} [height] The height of the image to scale to.
 * @property {number} [width] The width of the image to scale to.
 */

/**
 * @typedef {Object} EmbedThumbnail
 * @property {string} [url] Source URL of the thumbnail. ( HTTPS links. )
 * @property {string} [proxy_url] Alternative URL to the thumbnail.
 * @property {number} [height] The height of the thumbnail to scale to.
 * @property {number} [width] The width of the thumbnail to scale to.
 */

/**
 * @typedef {Object} EmbedVideo
 * @property {string} [url] Source URL of the video. ( HTTPS links. )
 * @property {number} [height] The height of the video to scale to.
 * @property {number} [width] The width of the video to scale to.
 */

/**
 * @typedef {Object} EmbedProvider
 * @property {string} [name] The name of the provider.
 * @property {string} [url] The URL of the provider.
 */

/**
 * @typedef {Object} EmbedAuthor
 * @property {string} [name] The name of the author.
 * @property {string} [url] Source URL of the author.
 * @property {string} [icon_url] URL of the author's profile icon.
 * @property {string} [proxy_icon_url] Alternative URL of the author's profile icon.
 */

/**
 * @typedef {Object} EmbedField
 * @property {string} [name] The name of the field.
 * @property {string} [value] The value of the field.
 * @property {boolean} [inline] Whether this field should be inlined.
 */

/**
 * @typedef {Object} Embed
 * @desc Details an embedded object that may contain markdown or links.
 * @property {string} [title] Optional title to be used for the embed.
 * @property {string} [type] Type of the embed. Always "rich" for webhook embeds.
 * @property {string} [description] Description of the embed.
 * @property {string} [url] The URL this embed is referencing.
 * @property {string} [timestamp] The timestamp of this embed.
 * @property {number} [color] Color code of the embed.
 * @property {EmbedFooter} [footer] The footer of the embed.
 * @property {EmbedImage} [image] Image information.
 * @property {EmbedThumbnail} [thumbnail] Thumbnail information.
 * @property {EmbedVideo} [video] Video information.
 * @property {EmbedProvider} [provider] Provider information
 * @property {EmbedAuthor} [author] Author information
 * @property {EmbedField[]} [fields] Field information.
 */

/**
 * @typedef {Object} Attachment
 * @property {string} id Attachment snowflake.
 * @property {string} filename Attachment file name.
 * @property {number} size Size of the file in bytes.
 * @property {string} url Link to the attachment.
 * @property {string} proxy_url A proxy to the file's URL.
 * @property {number} [width] Width of the file if it's an image.
 * @property {number} [height] Height of the file if it's an image.
 */

/**
 * @typedef {Object} Message
 * @desc An incoming or outgoing Discord message.
 * @property {Array<Attachment>} [attachments] Message attachments, if any.
 * @property {MessageAuthor} [author] The creator of the message.
 * @property {string} channel_id The channel this message belongs to.
 * @property {string} [content] The raw message content.
 * @property {string} [edited_timestamp] If specified, when this message was edited.
 * @property {string} [guild_id] If this message belongs to a Guild, this is the ID for it.
 * @property {string} id The message's unique ID.
 * @property {Embed} [embed] Optional embed for the outgoing message.
 * @property {Embed[]} [embeds] Optional embeds for the incoming message.
 * @property {MemberInfo} member The statistics for the author.
 * @property {boolean} [mention_everyone] Whether this message attempts to mention everyone.
 * @property {string[]} [mentions] User IDs or roles mentioned in this message.
 * @property {string[]} [mention_roles] Role IDs mentioned in the message.
 * @property {string} nonce The unique timestamp/snowflake for this message.
 * @property {boolean} [pinned] Whether this message was pinned.
 * @property {string} timestamp When this message was sent.
 * @property {boolean} [tts] If this message should use TTS.
 * @property {number} type The type of message this is.
 */

/**
 * @callback EventHookCallback
 * @desc This callback is executed when an event occurs.
 * @desc {Object} event The event data that has occurred.
 */

/**
 * @typedef {Object} EventHook
 * @desc Defines an event that is handled via the dispatch event.
 * @property {string} type The type of event that's handled.
 * @property {EventHookCallback} callback The callback event to be executed.
 */

/**
 * @typedef {Object} PublicKeyInfo
 * @desc Information on a public key used for a key exchange.
 * @property {Buffer} salt The user-generated salt used with this public key.
 * @property {Buffer} key The raw public key buffer.
 * @property {string} algorithm The exchange algorithm being used.
 * @property {number} bit_length The length, in bits, of the public key.
 * @property {string} fingerprint The SHA-256 sum of the public key.
 */

/**
 * @typedef {Object} SessionKeyState
 * @desc Indicates an active key exchange session.
 * @property {PublicKeyInfo} [remoteKey] The remote party's public key.
 * @property {PublicKeyInfo} [localKey] The local public key information for the session.
 * @property {Object} [privateKey] The local private key corresponding to the local public key.
 * @property {string} initiateTime The time this exchange was initiated.
 */

/**
 * @typedef {Object} GlobalSessionState
 * @desc Contains all session states being actively established.
 * @property {string} channelId The channel this session establishment is taking place in.
 * @property {SessionKeyState} state The local state for the session.
 */

/**
 * @interface
 * @name PatchData
 * @desc Contains local patch data and state of the function.
 * @property {object} thisObject Original `this` value in current call of patched method.
 * @property {Arguments} methodArguments Original `arguments` object in current call of patched method.
 *      Please, never change function signatures, as it may cause a lot of problems in future.
 * @property {cancelPatch} cancelPatch Function with no arguments and no return value that may be
 *      called to reverse patching of current method. Calling this function prevents running of this
 *      callback on further original method calls.
 * @property {function} originalMethod Reference to the original method that is patched. You can use
 *      it if you need some special usage. You should explicitly provide a value for `this` and any
 *      method arguments when you call this function.
 * @property {function} callOriginalMethod This is a shortcut for calling original method using
 *      `this` and `arguments` from original call.
 * @property {*} returnValue This is a value returned from original function call. This property is
 *      available only in `after` callback or in `instead` callback after calling `callOriginalMethod` function.
 */

/**
 * @callback PatchCallback
 * @desc A callback that modifies method logic. This callback is called on each call of the original method and is
 *      provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
 * @param {PatchData} data Data object with information about current call and original method that you may need in
 *      your patching callback.
 * @return {*} Makes sense only when used as `instead` parameter in _monkeyPatch. If something other than
 *      `undefined` is returned, the returned value replaces the value of `data.returnValue`.
 *      If used as `before` or `after` parameters, return value is ignored.
 */

/**
 * @module discordCrypt
 * @desc Use a scoped variable to protect the internal state of the plugin.
 * @type {_discordCrypt}
 */
const discordCrypt = ( () => {

    /**
     * @private
     * @desc Internal class instance.
     * @type {_discordCrypt}
     */
    let _self = null;

    /**
     * @private
     * @desc Master database password. This is a Buffer() containing a 256-bit key.
     * @type {Buffer|null}
     */
    let _masterPassword = null;

    /**
     * @private
     * @desc Used to store all event dispatcher hooks.
     * @type {Array<EventHook>}
     */
    let _eventHooks = [];

    /**
     * @private
     * @desc The index of the handler used for automatic update checking.
     * @type {int}
     */
    let _updateHandlerInterval;

    /**
     * @private
     * @desc The index of the handler used for timed message deletion.
     * @type {int}
     */
    let _timedMessageInterval;

    /**
     * @private
     * @desc The index of the handler used for garbage collection.
     * @type {int}
     */
    let _garbageCollectorInterval;

    /**
     * @private
     * @desc The configuration file currently in use. Only valid after decryption of the configuration database.
     * @type {Config|null}
     */
    let _configFile = null;

    /**
     * @private
     * @desc Used to cache webpack modules.
     * @type {CachedModules}
     */
    let _cachedModules = {};

    /**
     * @private
     * @desc Stores the update data for applying later on.
     * @type {UpdateInfo}
     */
    let _updateData = {};

    /**
     * @private
     * @desc Array containing function callbacks to execute when stopping the plugin.
     * @type {Array<function>}
     */
    let _stopCallbacks = [];

    /**
     * @private
     * @desc Contains all active sessions that are being established.
     * @type {GlobalSessionState}
     */
    let _globalSessionState = {};

    /**
     * @private
     * @desc The original methods of the Object descriptor as well as a prototype to freeze all object's props.
     * @type {{freeze: function, isFrozen: function, getOwnPropertyNames: function, _freeze: function}}
     */
    const _Object = {
        freeze: Object.freeze,
        isFrozen: Object.isFrozen,
        getOwnPropertyNames: Object.getOwnPropertyNames,
        _freeze: ( object ) => {
            /* Skip non-objects. */
            if( !object || typeof object !== 'object' )
                return;

            /* Recursively freeze all properties. */
            for( let prop in _Object.getOwnPropertyNames( object ) )
                _Object._freeze( object[ prop ] );

            /* Freeze the object. */
            _Object.freeze( object );
        }
    };

    /**
     * @private
     * @desc Defines how many bytes can be sent in a single message that Discord will allow prior to encryption.
     * @type {number}
     */
    const MAX_ENCODED_DATA = 1820;

    /**
     * @private
     * @desc Defines what an encrypted message starts with. Must be 4x UTF-16 bytes.
     * @type {string}
     */
    const ENCODED_MESSAGE_HEADER = "⢷⢸⢹⢺";

    /**
     * @private
     * @desc Defines what a public key message starts with. Must be 4x UTF-16 bytes.
     * @type {string}
     */
    const ENCODED_KEY_HEADER = "⢻⢼⢽⢾";

    /**
     * @private
     * @desc The Nothing-Up-My-Sleeve magic for KMAC key derivation.
     * @type {Buffer}
     */
    const ENCRYPT_PARAMETER = Buffer.from( 'DiscordCrypt KEY GENERATION PARAMETER' );

    /**
     * @private
     * @desc How long after a key-exchange message has been sent should it be ignored in milliseconds.
     * @type {number}
     */
    const KEY_IGNORE_TIMEOUT = 60 * 1000;

    /**
     * @private
     * @desc How long after a key exchange message is sent should a client attempt to delete it in minutes.
     * @type {number}
     */
    const KEY_DELETE_TIMEOUT = 5;

    /**
     * @private
     * @desc Indexes of each dual-symmetric encryption mode.
     * @type {int[]}
     */
    const ENCRYPT_MODES = [
        /* Blowfish(Blowfish, AES, Camellia, IDEA, TripleDES) */
        0, 1, 2, 3, 4,
        /* AES(Blowfish, AES, Camellia, IDEA, TripleDES) */
        5, 6, 7, 8, 9,
        /* Camellia(Blowfish, AES, Camellia, IDEA, TripleDES) */
        10, 11, 12, 13, 14,
        /* IDEA(Blowfish, AES, Camellia, IDEA, TripleDES) */
        15, 16, 17, 18, 19,
        /* TripleDES(Blowfish, AES, Camellia, IDEA, TripleDES) */
        20, 21, 22, 23, 24
    ];

    /**
     * @private
     * @desc Symmetric block modes of operation.
     * @type {string[]}
     */
    const ENCRYPT_BLOCK_MODES = [
        'CBC', /* Cipher Block-Chaining */
        'CFB', /* Cipher Feedback Mode */
        'OFB', /* Output Feedback Mode */
    ];

    /**
     * @private
     * @desc Shorthand padding modes for block ciphers referred to in the code.
     * @type {string[]}
     */
    const PADDING_SCHEMES = [
        'PKC7', /* PKCS #7 */
        'ANS2', /* ANSI X.923 */
        'ISO1', /* ISO-10126 */
        'ISO9', /* ISO-97972 */
    ];

    /**
     * @private
     * @desc The default host used to upload encrypted files using the Up1 specification.
     * @type {string}
     */
    const UP1_FILE_HOST = 'https://share.riseup.net';

    /**
     * @private
     * @desc The API key used to authenticate against the Up1 host.
     * @type {string}
     */
    const UP1_FILE_HOST_API_KEY = '59Mnk5nY6eCn4bi9GvfOXhMH54E7Bh6EMJXtyJfs';

    /**
     * @private
     * @desc Stores the compressed PGP public key used for update verification.
     * @type {string}
     */
    const PGP_SIGNING_KEY = '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';

    /**
     * @desc The Base64 encoded SVG containing the unlocked status icon.
     * @type {string}
     */
    const UNLOCK_ICON = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwI" +
        "DI0IDI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdjMS4xI" +
        "DAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem02LTloLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgN" +
        "yA2aDEuOWMwLTEuNzEgMS4zOS0zLjEgMy4xLTMuMSAxLjcxIDAgMy4xIDEuMzkgMy4xIDMuMXYySDZjLTEuMSAwLTIgLjktMiAyd" +
        "jEwYzAgMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6bTAgMTJINlYxMGgxMnYxMHoiPjwvc" +
        "GF0aD48L3N2Zz4=";

    /**
     * @desc The Base64 encoded SVG containing the locked status icon.
     * @type {string}
     */
    const LOCK_ICON = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI" +
        "0IDI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0aCBkPSJNMCAwaDI" +
        "0djI0SDBWMHoiIGlkPSJhIi8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iYiI+PHVzZSBvdmVyZmxvdz0idmlzaWJsZSIgeGxpbms6aHJ" +
        "lZj0iI2EiLz48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNiKSIgZD0iTTEyIDE3YzEuMSAwIDItLjkgMi0ycy0uOS0" +
        "yLTItMi0yIC45LTIgMiAuOSAyIDIgMnptNi05aC0xVjZjMC0yLjc2LTIuMjQtNS01LTVTNyAzLjI0IDcgNnYySDZjLTEuMSAwLTI" +
        "gLjktMiAydjEwYzAgMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6TTguOSA2YzAtMS43MSA" +
        "xLjM5LTMuMSAzLjEtMy4xczMuMSAxLjM5IDMuMSAzLjF2Mkg4LjlWNnpNMTggMjBINlYxMGgxMnYxMHoiLz48L3N2Zz4=";

    /**
     * @desc Defines the CSS for the application overlays.
     * @type {string}
     */
    const APP_STYLE =
        `eNqlWG1v4jgQ/iu+q1YqUo3yCgWkfrsfYhIHfA1JlDgt3Wr/+83YcWInhiLdstqFxB7PyzPPzHidZ7T+4G3Jvsg3KepK0oJdRPm1J5e6qruGZfygn3fiN9+TMGmuB3Jk2fuprfsq35P2dGTPwQsZ/q5f0xX5S1yaupWskgfS1J2Qoq72pBBXnh9ILroGztuTqq5A+KfI5RkEB8GvAzlzcTpL86vkBXwPDkTWjfr/NxVVzq/qPfzM+rar2z3JecH6Uh7+rMEckdUV2HKsr7Q7s7z+hJ3wSZurUVV91unKtmMwLw5gGf4D7+o25y1tWS76bk9SVOjC2pOoaGuUxHVGZb1rsEb/KMqawRs0Q+sm67qUogH1RieIqhQVp8eyzt5tZ7W8ZFJ8cHej9Z1KfpUg6UN04ihKIUHYWeQ5r9yAhZZaYRS44aNZXaIHP1j7TOmFgXHqyQt52kavu5yBk4YlT0VRQCTgUMpKcQIVM15J3i49hUc0LM9FdVK/MHKTYezY1WUv+RDVMErHSNs+1k/oRilsxf2+P/Z7VoBO4BbfgYAMCTrvyd9/o9ZS1hcXah4F0gkL2hgQJnIiW1ZBdrQcIT44QEt8wKW2Cfuqls+2GTkE/ovnq/0ZE/OniKvvpYsSI+K2BKX94J6gI6wsSdgdbgvusrYuSyoZPIHtKBawDZnFelmjx67UpAG6UCszLDa+C0ffPSVRkiY7N/WtPW9EnjnLca/FM095jJ8Jj0gBnl3wf6t+IAgMCpG13LXHOv8a1+JZPmSP+6Of9r+RYw/Rr+zUHnJa42nwlRKSnXn2DgT1Quxfe5ZhwoOEAYEqPzQAHUyGiFIPUxD6yY/vAqxoGs4gxBk3JFv3EmlmxrmpQ2BR6ucGnfieMLIdfjxMqVNm4l9RdVwSGkXIBeoz7jUqT4iked8ybVkUBJfOddmY304u32YXVGXwmsWD2tSfDPfluFMObBvRNkAZ2czrTLSaWaC+8HxMjTuEEbNtmIUrnzctZ+qNKtkXO71Hj07UnokWAaPGmnhuTZAOMhvWdZ+gPy0EL9GYwbW79NcEeV0hHRxNFX5eJu63FdoLGoPRiME7PlNaDr0N1QltVLXKY7TUcNQp3Pj6gBtJEvIojJI7UExnZUahq6jbywA0SGL+TOHVC8F/ZwagiQ7zmlLvO284BQ4ZOhX8qpX4NRU+/G6CZvdeOw1t7ep4SvcojrYR8xofb+JdXDht38xt8UigQLOQUmzG7k6uPdKHRou4zauSi62W642aAN0+08B1ZPm+ySEa1IMX3f86+P7Tl7inFJ0cuduPb1xCO/lVciq/GpCWiTbDGmtJeINVduVSG60FtFXUMVkeqFZ4CZafHe3Ea95LL53tqmTXqNDXMEdLrxulXzl+RvRtMQYmetRqY/sO5HW85JkcRCzN1K8dIx/h71j15/fwpIeJqumliwODyw6Eg3KtmOHeblkgNK6TJ/nO84UiY4Ge+tGpX527/1aLoDoabJyxTKYG29qkkh15eXPk8yq9DV6DHUDtAqeYOmoat7Yvwbmqe7I7oKLki2xRBanOh5HnMRUs/8CAuU1bfsFsgrlpTGT1aATRdWpgXTcE3iqja1sSrTx2n4GZccmvFyQLWLZ1Vo1ZAcXCP/a6k5wD3jW0k15WX4LZrYeghI9tDUaWrH3j7LFpdXu9+6lkqKKpxaxNRnYcKHLBmc7MsU672zTvS1WDobGO3LJlGHp8fPAUZVERxz6ytASsxzbcJ2GogX4JdGhK7RRw643qjoywXbR7ZdGdwoUJo7pTTbmsEpehMy5Yzv8pCmQ+HNzuNU4uUpTiZ6F0XNwSzCaXae0baazSprvO2OR+93GaA6iGQKopcr05WNsUDhboMVySOD35OLGB+DGmTqfsNrxw7so++FXv1jH9nt3cLAkz/Z/3Ior6qJD80t28GInHNlv8VvEds9b2vebMRfoMXtIIGe+cVLFAQl4+GTboCxQl7nMc0YEF/+07KYovOs5RRmmXVjdO5cfGe3jkGT9vlGsdAtpdWFl+TwFGbNsUZluxeGm7Y6widsJ/3wyeC5PNdnvMEpc8bWE6+b8fg0J63HDGbwqDogNHd9xKjiDZJtvDQw3ZcuBWmR0lwcs2xL/reOWyqjqFrMNtRzjr+MvcBvuVNXlOjw8e5Uf3OrPqXJXN6iGjfPJve3x+CI6Af9adZNC+8A9edrNrXj0YIzdFs9teddlreAjfYRrBOjebIrdlD52rP/v6apewZFmnwmA+w2IqsZaecAV44vkpSfDii+CM9xQncRrv1ASCs54y68huVS4WHaPi4DUX7QnnBmNAjF2vqJdncjSGxp7u3Sq6dzpP54m5rZ9soXiRU52mmw4jPZnfjs8GsvuDnu+mzmny6A7+PEzody5ZAkJDdc2yuI3Aa5D/AJc2fGE=`;

    /**
     * @desc Contains the raw HTML used to inject into the search descriptor providing menu icons.
     * @type {string}
     */
    const TOOLBAR_HTML =
        `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`;

    /**
     * @desc Contains the raw HTML injected into the overlay to prompt for the master password for database unlocking.
     * @type {string}
     */
    const UNLOCK_HTML =
        `eNptkEFuwyAQRa+CqLJEps7OcbzqAXoFDNhGxYBgnNS3D8RgJ1VZDOjP/OHpt0LdkBJXLDiZWQDpib1Jr9mKEdcshGenSB1qX+azSrg00TcoqcU/pvd2gFXLKwbrGnSmp7gRtVNdZG619c3HMNB4Lrh8NEkmIljmm8OIu7aa6uTtfdU9S3wHx0yxOG9nB38saWCfVsYtgGB18V8Xme/Wv+EXjWTyvFj05JgGBQn7iwHrWZDou3Sqwoa2xI61ftERiGk1mj0Nx4RQZiQplZq630uKJfoXAGtevJuw2+5KwNR8Uno6olqMtvyHiExEejAbTBUxunxt9QFqPKki`;

    /**
     * @desc Defines the raw HTML used describing each option menu.
     * @type {string}
     */
    const MENU_HTML =
        `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`;

    /**
     * @desc These contain all libraries that will be loaded dynamically in the current JS VM.
     * @type {LibraryDefinition}
     */
    const EXTERNAL_LIBRARIES = {
        'currify.js': {"requiresNode":false,"requiresBrowser":true,"minify":true,"code":"eNqdVFFv2yAQ/iuONaWgEit5jUujae2etvZlfbKs1rWhYaLgYWgWOfz3gcFOKuWh3Ys5HXcfd9995xk1otZMCiBgzyhI5fNvUusUY71viaQJ+dtKpbv5PDWiIZQJ0qSz8fJVNoYTGI4shmIBYE54RxKPN+IfEQPKfB7OrHptYDBBUSIRUntOdKJyoPC5Z3dMNHK3Ccf6XMQLl88V34TjbERHON34z1pvWQez2ijF6N4Xby2YWIH9W6USgRQiuSLaKJGMd4kAzos07CePBBSZgccZKWgZLDVYHqbGZ+hQ5I9hyvERjdznmPm8hvG92oHOltD72ehj0edRORZkl9wqJRV4+lYJIXXimm3idJKLLz21F08w11sldwnPatkQnP68v3n4cft4d//r8fv9w91Nirj1cC32peM+TnPdW5v7FoplmdUV56AdB41OteNTCR4CV2UhypEtCcjhIKBFLTomDnw65mwM8i+Ol0MR7ENMUdexF4rAy1xc6YwT8aK3ubi8hBJoVwScqrCgjxNeF8eyfRmwT43TaqcVc7ofGNX4dMawDyDFabsRV2VV2/I9eJOsSZaoUi/mlQjduX5PXiGfjfei+mwGkv+Tg9gHskqbn0g8/iim+UwrJWBQWJBiSkXSbaXhTfJMpqWZpW7o05/iPc1+nEFG09txpIjhr0pVe0CuVxuyWK2XEFG8yumVE4GbNivoYlUe05yc/LpIh4pYxLjGKlrwfMMsrJM5VkXARI54H1sotwxS1JUGDA2lZa2SWnomso6zmoRdOZIIHfn1VMJirGqxQnwUqQYGFnV5OBhrUe9Ydx9UpFG3aQnBZEML838pAQw+"},
            'curve25519.js': {"requiresNode":true,"requiresBrowser":false,"minify":true,"code":"eNrtXAtT20i2/ivMVNZlxQ2r7tZzjJiChLyZZDZhixTlsMLIRsFIHsuGkMD89vudPpItvxJmJnu36t5NSm7163ynzzl9+il+nBTJRjEepd3xj+3+ID+NB1uPJqOrRLmuDKPuIC6KjdGXYhyP0+7GSZql45Nhnmbj5sj60s2zYrwxjrLkeuPJII/HnrM7GsU3TelZ7bSHIr181Bwk4408stv59mhrkGT98Xk7b7Ws8XHeiUb4aY+S8WSUbYzvKpR+z25aX8rk0VYd1aoVkusKHcvOrJxU0vPctUVdT6pQ1Co8XltU20GghRO6WsgwlI7Qtgx84bqO5wvp+bYrlKfxKpVwQ9ehAm7gIstFlvZsHQrPlfiV+BcK5QeBJ5Qdhm4NXq3F96QPamFoe0KHgQoEKPqOcFzEhNaOlMJVSFDKEa52XSU8KX2JLFvaQHaQ4PiORgEFJlzX95UIEZmhH62Xk4N2ohGegwZJT3rClUTRUaG2hQ5kAHRpOzZkEBIDniMJD4wK1w8hACfUqKWkayNFuaEtpGNrVwSuq2ccvF/LgfKUTdQVJP9v+J2x8HwtCxCx9oQMQhfCD1202HZQ3w2cIBCOo9EaD+0TkpQKASsb1uAGZB5kNNKG/lyf8hQq+iLUMBLYgg5n6N3zpHthutG7m2FSgBfqQKN21ZXG6Erj7XjUn1wm2bioutQYXQpd7sfj/PRj0h1vHILhwJDp/PhDFDVH0WuTsTUc5eN8DNJb4/wtOn7W3+rGg0FzSvF43LEsa3w+yq83qGcTG/ujEeD/NcmST0MQSc42iMLGgy+jO7FBLmQG969ZS0Y3w3F+cpWM0t7NiVbNkRiLXGTWl94k647TPNtIqzSRcjsTUaB91NYEYbKdthM0rLiFpxi3ks6H/DhDULqMpmwUm3JnZyewNuVdqbIZSa2mrBTJ2Dg0ymOg3ICwX5Ke8UjkjCL7lhzTrN5gWk/kXDNrs99Lo9+b+aa02vNOriSWRWmjSRQ/ED1LmNcoE2MOK4Bh3L1gBEN/KpiM/KtRNzUlkgaEVQ8AUnZOIum0spaH/uOizEE8Pt/qDXJq1t8p0SPUcSfKN03sYdYeHdudVpRtypb2HzYRWneEkQqIvWxVL1pwuCJeTDG8pOAlJV5S8BIfp4DBj8nKmrElZj+sSGUU+YXye+AiivFDfKEXpGgeSLmGVI9IET3DtLuJ0umm7OzsSK8hLcGxRmQy271j6VJp/G5q5Xs+FUdXrkoXkSnBUWGyyqpitDXVbSx6Qm4W1t1Su8bH6iHYQbEGsSRMvCWZQZjdTIujUonVoJibQXHWK5owxvbUqcy0nsMehWzkkEZFbJLNsr9prsRR3mk1TQjOtrcD4FCjG5GRSEX1dJB3L+Kzs8qSK6PNQDIjkpkhmRHJrNNCP+vMVS0mp/erurlUdZRPsrO5HiRSsgrq6qKHJ8bTxTPBM8BzgucczwWeIZ5TPDd4zvBc4+nj2cVziWcPzwGeQzxXePbxvMPzEs9bPE/wPMfzBs9jPK/ANKvoY0RSF0cIZEe8R6A64hEC3RGvETgd8QmB2xGfEXgd8QCB3xG/IQg64imCsCOeUXWQeUEh6PxCIQj9SiEo/YNCkPonhW4HvSBqZhCU3bEefhQFeuPDI9Gj4L2IKXgkuhS8FhMKPokBBZ/FCQUPxDkFv4kLCp6KIQXPxCkFL8QNBb+IMwp+FdcU/EP0KfgnARlYaWB7DBszbJdhJww7YNgThj1n2AuGHTLsKcPeMOwZw14zbJ9hdxm2V8IqAxszbJdhJww7YNgThj1n2AuGHTLsKcPeMOwZw14zbJ9hdxn2kmHjElYb2C7DThh2wLAnDHvOsBcMO2TYU4a9Ydgzhr1m2D7D7jLsJcPuMWy3hHUM7IRhBwx7wrDnDHvBsEOGPWXYG4Y9Y9hrhu0z7C7DXjLsHsMeMOykhHUN7IBhTxj2nGEvGHbIsKcMe8OwZwx7zbB9ht1l2EuG3WPYA4Y9ZNhBCesZ2BOGPWfYC4YdMuwpw94w7BnDXjNsn2F3GfaSYfcY9oBhDxn2imFPSljfwJ4z7AXDDhn2lGFvGPaMYa8Zts+wuwx7ybB7DHvAsIcMe8Ww+wx7XsIGBvaCYYcMe8qwNwx7xrDXDNtn2F2GvWTYPYY9YNhDhr1i2H2GfcewFyVsaGCHDHvKsDcMe8aw1wzbZ9hdhr1k2D2GPWDYQ4a9Yth9hn3HsC8Zdli5C3ZTp4x7w7hnjHvNuH3G3WXcS8bdY9wDxj1k3CvG3Wfcd4z7knHfMu5phct+6oZxzxj3mnH7jLvLuJeMu8e4B4x7yLhXjLvPuO8Y9yXjvmXcJ4x7U+Gyozpj3GvG7TPuLuNeMu4e4x4w7iHjXjHuPuO+Y9yXjPuWcZ8w7nPGPatw2VNdM26fcXcZ95Jx9xj3gHEPGfeKcfcZ9x3jvmTct4z7hHGfM+4bxr2ucNlV9Rl3l3EvGXePcQ8Y95Bxrxh3n3HfMe5Lxn3LuE8Y9znjvmHcx4zbr3DdavjTwcOmAXxv0WhBUQP8yCIvTlHDwGuLvCtFDSOfLPJ6FDUMfbbIG1HUMPbAIi9BUcPgbxb1XooaRp9a1Ksoahh+ZpG1U9Qw/sIiI6SoacAvFtkGRU1DfrVIZRQ1DfqHRZKk6CvTPprson3NhBONPI8sq4VZpbR4om6Vk3Ek1SbsWTlhpykrCBSt9H6le1S6d9/SMZWO71u6S6W79y09odKT+5YeUOnBfUufUOmT+5Y+p9Ln9y19QaUv7lt6SKWH9y19SqVP71v6hkrf3Lf0GZU+u2/payp9fd/SfSrdv2/pqcmn5boS4X9t/r82/3/a5uetXdDGSpQgkJ2oQKA6UQ+B7kQxAqcTdRG4nWiCwOtEAwR+JzpBEHSicwRhJ7qg6iAzpBB0TikEoRsKQemMQpC6FmZ9H/WXF9knZ0kx5p2k0VZt7U2bSPl0MyzNrmpbTrwYzpY2eczG0PJWTza31ZNGytXtdIdKbG5adVDmJROZJdQPUZQ2Gg4Hc5whH0y0V+y8AIawFjYTi248iEeXk4FpJu0lVptxy/st8ExLJxOBzS0rRK/cBlja3oITWEyZLKUMllJOllLOV26c9Wh/c1vLdo92bI97JM1eKc1jDb1L5Tdyerv1HJHCsBqRcgIx2qpvDCUkVyYFiRGpLpFK8CMG9BbTz4R+eDuV9tuiAf1I1FOu0+6R1jY3e1YRgY2dnR3dwU/Tb/SshpzfH+uKwqqnTMSAU6a7SiciFpNpCm0WxXMpVGYCOoO5Mt25lJrZDMTJquRzEc8nA2WylEY4J3+IuxpEt0aOClJTz1eAQrXVydIcFBEeLDE0WcH4Mt0BGE9WM3Vi3UcjNQMrrQIG0ZIem4OgiFZsFibiwPt0q4jnkIHAFLlfXETJFgQQT3vTsJ5AJ3zT7cypQ7kQFwtNGoohp9U3uoeWsBf69XlcnE/3F2ub4NWJAW9k7+wopwEqtK9N27C52dmtEpRJCKZxzTu3uYmgcdlcddck1Kp7JmFW3efq2d3yacXM68BTS0+7yrEDOuELfc933ICOiELH8R1HCs9WQSh95QptO6FW2qEjudBznMDRYYhXJW07dH0tlPS1Cl0XvT30ZBj4IC1AWXoqcHwlpGsHIR0faTpZ1IF2lOcK5WBM0q6PWirUYEC6fihU4Nu+p5WS5tAOrLmejVfl6EDagS2Ur50g0Dp0hJa2GwaOLelkzwlDPiq0faVc5aMxYNqToOYICcQgINaEdkObWoT6MlSu7QeaDsFsL5CBAm9ojaeQqmxPhKHUICGR6EmgggMtPK0DW2sJUvBvCmDgCtIJfTTFgzgD7erQJraUh39Sk2QdGyWVgzKCJGwOz5DvoCLABMQrlad8SNOznQBMKyTayIKMtRa+b0OpIdiTTuiGoR1Sq5UTQrZSQcSBC1pSaRfSdl2SfaggIN9VMoAg6OTXs+lYk44ywyBEEe0L0HSUsoMAZcMw9CWwSAeopMFaKHzP80nCqBW6CjQCGIxy4T9CJ4C6NIxAS+2RbShIRfvQl0DouT6MCTza2nFccI9UN3Bc6FdCMI7ngYBpBAShPGMbvhto5ZEOIGLl0HmlkB4q+KH2BESpoVubznGhCR/MOJCLJrYkGRmMBUgaelWh4+PNmJ5SgQ3LRC0YL1SsQmnkHhAGxEnnoRAFHdGiyTAcTSe8kBM0Z7vUAOmQ2sj0JKkBNmtOSj3fDWFXZMceGSnEiabaPlTnk5VCjS76CHFjB54GdyRY2J6iE28tSRoOykFwboji0DREBIt20Tt8Ohh3Ybq+Tyx4gLapq7oSWnQDMj68IIlOYvFqg/PAJkPXCn0WTMDiQlCQMBWkej7UBJ2BMYBqqhW46DUhBCoc8ESmZ3qUDanAaoRrk4bowBzqBYvoPa6A2oHqkop9FAhgklqgN8J0Ah88+QEaAMdhixAVNLwDHeNDvraPplKPVNRjJPUSzBcgcXQo6ZL4IVBNFq9hMCEp3ndAU/tkZPBFtvbgm6AYWLdHXQnVfOoIMH9Ug0whb0m2Qf1EhdR9TKNgEygAl4QuqdGnyScEcHzKEQ548mE0kIoDT6XploFAi7zQiBWi8iAUuiuhfbRCAoUsHl1bS4d8FboMNEIuUMMBQkgqNC0DAza1F51Jwjg8unMBjmBzoVEyrNLzwZNAR4KwqEfAn9GtDI8uScAuIHwX+oClwHRsKurYkBF1UmW8nQyIWQkLlDqgKw6QF1rtwOBgU7BcWDIZXEjOivQFCYJbG/QdutGBjmbaAl8HwxBQJZwSWincwHfQzdHhICXYd2gMMPB8NIC7A0zJMw3FqsIhiyGhwwRtcoSK+hgNJ7AbFZCjhINDk+wQXEoaYuCwyMrh9mGIjmtTV0M3hBSAAVbM+OE7Ho1GaCgaTTYIj0H+IJSdcnr8PBtrNb22g7X4cqKZMfcEzTponnEizsUFxvVTcSPOxLXoi11xKfbEgTgUV2JfvBMvxVvxRDwXbyJaGInHES2MxKuIFkbiY0QLI3EU0cJIvI9oYSQeRbQwEq8jWhiJT+aATHw2B1bigTlAEr+ZAx3x1BywiGfmwEO8MAcQ4hdzICB+LSe77WwH0+igzWeVh0g9pAnRISZEV1Hw8LD1K2Y8hzTzvmrZne1t5dzSKx2fSs+8KjpJNW+ALKqyzqysOyvrTcv6PI9nwMA2gGkPM7I3Io4eY2HxCkuJj1g8HGG58B4LhEdYi7/GzOoT1s2fsRp+gDXub1i5PsV69JnYjV6Iy+gX8ZLPrBvNd9EvlngbvduhiYt4UiXvR68t8Tza5+SXrVnx5lNKc26PwGxgfeBoYKIOokeIhrdP0SiNWezb1pRya0baFAKJpyWJIybxtCTx1JA4Kkk8b63i4mnj2YffnzZerIM4arz/8PtR49G6+umxgs5kZ119k9+p197HSujwb5j4Ug1QKDhmLdTdr1VBIm0IN6fA77h0Waemg4Py9eXtW7KB1RrZK1+f3NJG8hMmxcVXa+oT0lRw+2Z7m8T6hmK3n7a3tV3GfIopd72e3jCBT0zAkCNqhsAnQ+BNSWDWaJbOp8bnD58aDz58bjywlgm/aTz+8Kbx6sPjxqt61YuqxNcFZy22HxY9J766ZM9Wy3JSkxlzfLCCz706d4+jHvxNDGfThaeZ/Fle30cDuKYT+KVzOLMLeKQh3NEpfNENHNHZQkueRddwSH14o124sEtBNhdF0jXXIK/gFK7IC13BKZB9XnXqTS8QX9H6/VnLqU7zqhVaxq7rtlPM0ldaR93M95iKXKbSbB4wJc4zIrndgwFJGNAB3bKimHLKmG9iX7HHPUPgoCSwZwgcMAGK+NYKrhyr1mlnDDkzjkKClbqkqEIDULLkGZY8y1rHjSktq+LK0NLMjldnB2/fMhUuSFqcdvTnxgiKWVJpF+2amj+ttvA3Vl3PZtBkGZiLIl9R5705NTuUbxZ4JerRp/X98fNqbh8vcCtn3MrvxS1W94+XuEXi5/XcPljN7asFbtWMW/W9uFWd6NUSt0h8sJ7b31Zz+3GBWz3jVn8vbnUn+rjELRJ/W8/t09XcHi1w68y4db4Xt04nOlriFolP13P7bDW37xe4dWfcut+LW7cTvV/iFonP1nP7YjW3jxa49Wbcet+LW68TPVriFokv1nN7jxnoPs/iK27978Wt34leL3GLxF8WuP21RbN/kW1SUN0Lzu54z25p1ROsWPQEtLm+cKKg3HIlFJc7pN2Ib2UmZlcdC2ws0rCmw6AAP4WVLVaUtDBGHJ4A6z3azMLCEnHamaR9ArM/hTisWWo3xCKTvgtIyF5oIUibLFheJ6QR2vDRjqddRNFk6TrSwfJYuRhwAO/YQai0S7sQBcHTmh0V3JDyAQ9GpPSRrxHXVD/Est+mbx8KglchcunjBB9xwPu0VwtmKNuj6tLVWDY6lA14jUUxlup2KNJmIgqzbyvyvxmxx5joxNt5Oza3eWO6FdrdzFsxr416dGuVivWOm3kEmW4i8rCZb2Pt+7P8ybaszbAT2SJr9kS+GYju313tBb4dSnVriy6N1yVmjzAZLDBgtF0cPIwhoJjWbHFnukU93W2mHfqvnXqJdCklWUopllLucWn6z50qtWsnEZkZAM2YPXdCMRDmAmteT58drg3mTidSU90QmksfmOqG0AKNVKRL5xmJGS4E3ZRdykmQQN+wLGQUZjwUdMd2DriAIou55vQAmC2c1RS1YxGq1V1KmczVKk89qUm9pZMXI8WJ6C4lg7/uitKaiEys+o39v2xD7dqhSTIvlUp1RiHJkjaMrpPFE5XUIpXIzoeI0svL6BnWMNP738sHp7VjjTJl8cjXMUextVMmOpUVdPiL0nfl5xqmPJUZV2XAN5prPuLiM6ppjixz5FKOWpuj69QKOpJpF3xyWVjMOTz6cfH34NbumOPLwqKr/6MtMgtzvZ5fx/RaVrDmpXIaF8m8So8XNfgH4512rQ0ZS+RooWkZi+P9UvKCLOpWwdI4MoBVxbpis9ox/2V+9oo/IKh/kjB3Gn6s6OzCnCO4IlRC0VGNkIEIAkEfRknXQxZ93KZoF1jQvq0JbfH1/7Raa0+v+pdGkkaeuSugFZSX8t5cBlefROmmVtBtirGgnWwX7VYrscbHCX+r4j0ks3uYHyebTSpowfoik4uRA4tKQe+bNJQ8zNplLWHuD9h3Mwj6BkXzRygV5abpMjs7jkXEK6oVxYYxtdmXSLXKm1FmatS6CnLLawstCeJj/j4Ec5by85Fx7SrDKDmbdJPm1xTjOaX42mUL2tm255gPLfLqQ4vlLEpFfLRlVD+u2UJ3+knnSZH2s2b5zRV6wswNFM3pl1j1mVJtBgSuyqnSfGK1PzydF61qD4a7v96rZufbmTnexmTVadWvUJS3K1SZqxXlplXuaKt+3Iwxaf6EO2vR72irVFAx617GQ0x4pCoHgEl1/2IKxofrKYOuwMOwCQgSxRQiqYhAg9NLHPZyS0x6sbKR5nKHmQUhIeaymGy1zF2QhymmQbODeraL+UZ3LcPU7JS7V7cO1ugqpS9PkCtLiEW3tITJaksYfCdLMNsXynUw25Kz9o9pzln13TnJGHuISUXlZJRzszITphSTKc1lQjGcS0Ki/KTKn1duzygXHqmm3d6CAQ1Er2ZAg2r2OuN7ZkDxGoNdNKCiIrLEp73ciMnxQnqJbNJ78+0usyihS59MUUKXy7a6sC6aX8O6ul+1rpLbSWli1YWrFcbU/U4mYb6VJR9I/I7Mp4kjEumo046nV6li8vsNumjFr7eR58xrqpwHGk3Fi/1latzQdiM+9nTHmP2gksQgSn6uOhFWI9ZPlWeNaZaG4rfRRAymrjnPrpLR+M3kdJB2XyY3X/+GUPzJ6Walo/odsownR7XFQbY88aAJeLKQMZ26pjTxXFouLMxOcyqUrxmJTvJhks0GnqkTStalzV0PmpuzrRBWes+vMEtJzBJSWltOO9/sC+YMc5tU2Nbd/OT5O9yitL95i1L+qeuT1VD+H13EVhJfP+Gv26VZJ+Sr7sH15leu1U26Hq05F2y2J3pmyblwOc8Ax9+6+FdLXl4oDlYsHhNR+vaFtXDMmxXJiqw1xb+ZZtZXyWpmi/ndgWrpXQjzLXYBzAX7KXcDzPrk+eJy4740f96UPzVr605TPoqinKfX/hST9DK3PFxF2qz4arsUNq806xd2V/T07qpB5TvMOL/LXCXtNWmObnE/2JSUQLOB1JolURemP31QYDpSmB5ckIcoOrUcDGllVjlRKAzt+UlClyYJtRlCd2GRSDc4uksTk3xukKvWzBPe+uFh0AzjmzxULjnGHI4xhq54VbfUELtdNfRuXUPp/mnlKTC1vKtmngBbHCHTqUspePimgTinkVWYXx7aqyGksNbeIT9ZXvmvHzBoGR+Fs8Yv7agwy6NJd4wmWl/G52mxVVysslaTNVyVdddPag0dzf4Qyc97k14vGW31Rvlls6xvTf+EB0r+tKqAITdKr+Jx8k16xbfoocBdMUfPSG5NOzGiFhfTKRdep3MufqdJ1+opW8k8Tdzs2dixTnlcWFQcVi9T5Co+ha8lmIlfBTctkH9D1vlaWWfJiCVTsGjQOX8oi6YFv6B2o/GDERHSWFR5/c+t8J9a+fEyKYq4n2xcTmCWp8lGvHFq6v9o/rKSpk8qmksTxDpbIGqVfxxmmfqQdbhxkdxMEbTaOL0ZJ8WP1lfUUhi15PgR/2k1jb+hpvEaNXXzy+FknLxNumC62vqETMfRoqrG1u3tvKbG1s9LZv7TV5RAVmAmkgt/1Gc8E4RR5Xitpq5HedbfGBqXYNTFBWtmUFL6BoXCNHeewvpPZ76iTzpDYESaNGdzSkhr4s/mxZ/Cd5Q7T0baK2Qyo/rDsiaWOs34D3ea8de6C8iJvyhOQOSNxoqWYS7r0cdPeUV0HdVRnJ3llxtn8The1NLSyNTMf8aw9xOmFa2p9bSBvbDTh6WNqPKnisvX6p72cOZ7f1r9hamR+V5pROuK0XSkXlAxTwjKL9AqEyoTV3VGwZuUYPSAVbfeb/7vmMA9uupfso81tr9kId/BQGAddcuYduj7GYioSyabzQ5tMDoja92t26uol1oPnq8An4eGeZRWNbUQTDlGN1/mDXBqJqMt2lGoyq62ObDdjcfd89l86Ad5d1evN66Z7z3oVRPMORJ/0ZCH1Szwz5ryv2fm8a05x4oeZA7h/vQwt8a6pz3F7H+t3FXK6KvXqXFNrTDdtn/OJoPB3PCUTXU4c2HlvOD/mwKXYLNl2OwPw2Zfg83W2I3ZlzOOMfuWv4XWY6g3WTE/+tNGt2J0bM3sLvla7sIgiqXO/PA5n50vjLHmW8y8NsyusfBEpCKdWfhOZN/difLvPPZGSfI5aS79TVer/T8DsSy2"},
            'openpgp.js': {"requiresNode":true,"requiresBrowser":true,"minify":false,"code":"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"},
            'scrypt.js': {"requiresNode":true,"requiresBrowser":false,"minify":false,"code":"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"},
            'sha3.js': {"requiresNode":true,"requiresBrowser":false,"minify":true,"code":"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"},
            'sidh.js': {"requiresNode":false,"requiresBrowser":true,"minify":false,"code":"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"},
            'sjcl.js': {"requiresNode":true,"requiresBrowser":false,"minify":true,"code":"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"},
            'smalltalk.js': {"requiresNode":false,"requiresBrowser":true,"minify":true,"code":"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"},
    };

    /**
     * @desc Compressed Diceware word list provided by the ETF for passphrase generation.
     * @type {string}
     */
    const DICEWARE_WORD_LIST =
        `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`;

    /**
     * @protected
     * @class
     * @desc Main plugin prototype.
     */
    class _discordCrypt
    {

        /* ========================================================= */

        /**
         * @public
         * @desc Initializes an instance of _discordCrypt.
         * @example
         * let instance = new _discordCrypt();
         */
        constructor() {
            /* Do this as early as possible. */
            _self = this;

            /* ============================================ */

            /**
             * Discord class names that changes ever so often because they're douches.
             * These will usually be the culprit if the plugin breaks.
             */

            /**
             * @desc Used to find the search toolbar to inject all option buttons.
             * @type {string}
             */
            this._searchUiClass = '.search .search-bar';

            /* ============================================ */
        }

        /* ==================== STANDARD CALLBACKS ================= */

        /**
         * @public
         * @desc Returns the name of the plugin.
         * @returns {string}
         */
        getName() {
            return 'DiscordCrypt';
        }

        /**
         * @public
         * @desc Returns the description of the plugin.
         * @returns {string}
         */
        getDescription() {
            return 'Provides secure messaging for Discord using various cryptography standards.';
        }

        /**
         * @public
         * @desc Returns the plugin's original author.
         * @returns {string}
         */
        getAuthor() {
            return 'leogx9r';
        }

        /**
         * @public
         * @desc Returns the current version of the plugin.
         * @returns {string}
         */
        getVersion() {
            return '2.0.2';
        }

        /**
         * @public
         * @desc Starts the script execution. This is called by BetterDiscord if the plugin is enabled.
         */
        start() {
            /* Validate location startup. */
            if( !_discordCrypt._ensureProperStartup() )
                return;

            /* Perform idiot-proof check to make sure the user named the plugin `discordCrypt.plugin.js` */
            if ( !_discordCrypt._validPluginName() ) {
                global.smalltalk.alert(
                    'Hi There! - DiscordCrypt',
                    "Oops!\r\n\r\n" +
                    "It seems you didn't read DiscordCrypt's usage guide. :(\r\n" +
                    "You need to name this plugin exactly as follows to allow it to function correctly.\r\n\r\n" +
                    `\t${_discordCrypt._getPluginName()}\r\n\r\n\r\n` +
                    "You should probably check the usage guide again just in case you missed anything else. :)"
                );
                return;
            }

            /* Perform startup and load the config file if not already loaded. */
            if ( !_configFile ) {
                /* Hook the necessary functions required for functionality. */
                _discordCrypt._hookSetup();

                /* Load the master password. */
                _discordCrypt._loadMasterPassword();

                /* Don't do anything further till we have a configuration file. */
                return;
            }

            /* Don't check for updates if running a debug version. */
            if ( !_discordCrypt._shouldIgnoreUpdates( this.getVersion() ) && _configFile.automaticUpdates ) {
                /* Check for any new updates. */
                _discordCrypt._checkForUpdates();

                /* Add an update handler to check for updates every 60 minutes. */
                _updateHandlerInterval = setInterval( () => {
                    _discordCrypt._checkForUpdates();
                }, 3600000 );
            }

            /* Block tracking and analytics. */
            _discordCrypt._blockTracking();

            /* Start the garbage collector. */
            _discordCrypt._initGarbageCollector();
        }

        /**
         * @public
         * @desc Stops the script execution.
         *      This is called by BetterDiscord if the plugin is disabled or during shutdown.
         */
        stop() {
            /* Nothing needs to be done since start() wouldn't have triggered. */
            if ( !_discordCrypt._validPluginName() )
                return;

            /* Remove all hooks & clear the storage. */
            for( let i = 0; i < _stopCallbacks.length; i++ )
                _stopCallbacks[ i ]();
            _stopCallbacks = [];

            /* Unload the garbage collector. */
            clearInterval( _garbageCollectorInterval );

            /* Unload the timed message handler. */
            clearInterval( _timedMessageInterval );

            /* Unload the update handler. */
            clearInterval( _updateHandlerInterval );

            /* Unload elements. */
            $( "#dc-overlay" ).remove();
            $( '#dc-file-btn' ).remove();
            $( '#dc-lock-btn' ).remove();
            $( '#dc-passwd-btn' ).remove();
            $( '#dc-exchange-btn' ).remove();
            $( '#dc-settings-btn' ).remove();
            $( '#dc-quick-exchange-btn' ).remove();
            $( '#dc-clipboard-upload-btn' ).remove();

            /* Clear the configuration file. */
            _configFile = null;
        }

        /**
         * @public
         * @desc Triggered when the script has to load resources. This is called once upon Discord startup.
         */
        load() {
            /* Freeze the plugin instance if required. */
            if(
                global.bdplugins &&
                global.bdplugins[ this.getName() ] &&
                global.bdplugins[ this.getName() ].plugin
            ) {
                Object.freeze( bdplugins[ this.getName() ] );
                Object.freeze( bdplugins[ this.getName() ].plugin );
            }

            /* Inject application CSS. */
            _discordCrypt._injectCSS( 'dc-css', _discordCrypt.__zlibDecompress( APP_STYLE ) );

            /* Reapply the native code for Object.freeze() right before calling these as they freeze themselves. */
            Object.freeze = _Object.freeze;

            /* Load necessary libraries. */
            _discordCrypt.__loadLibraries();
        }

        /* ========================================================= */

        /* ================= CONFIGURATION DATA CBS ================ */

        /**
         * @private
         * @desc Returns the default settings for the plugin.
         * @returns {Config}
         */
        static _getDefaultConfig() {
            return {
                /* Whether to automatically accept incoming key exchanges. */
                autoAcceptKeyExchanges: true,
                /* Automatically check for updates. */
                automaticUpdates: true,
                /* Blacklisted updates. */
                blacklistedUpdates: [],
                /* Storage of channel settings. */
                channels: {},
                /* Defines what needs to be typed at the end of a message to encrypt it. */
                encodeMessageTrigger: "ENC",
                /* How often to scan for encrypted messages. */
                encryptScanDelay: 1000,
                /* Default encryption mode. */
                encryptMode: 7, /* AES(Camellia) */
                /* Default block operation mode for ciphers. */
                encryptBlockMode: 'CBC',
                /* The bit size of the exchange algorithm to use. */
                exchangeBitSize: 571,
                /* Default password for servers not set. */
                defaultPassword: "⠓⣭⡫⣮⢹⢮⠖⣦⠬⢬⣸⠳⠜⣍⢫⠳⣂⠙⣵⡘⡕⠐⢫⢗⠙⡱⠁⡷⠺⡗⠟⠡⢴⢖⢃⡙⢺⣄⣑⣗⢬⡱⣴⠮⡃⢏⢚⢣⣾⢎⢩⣙⠁⣶⢁⠷⣎⠇⠦⢃⠦⠇⣩⡅",
                /* Decrypted messages have this string prefixed to it. */
                decryptedPrefix: "🔐 ",
                /* Decrypted messages have this color. */
                decryptedColor: "green",
                /* Default padding mode for blocks. */
                paddingMode: 'PKC7',
                /* Internal message list for time expiration. */
                timedMessages: [],
                /* How long after a message is sent to remove it. */
                timedMessageExpires: 0,
                /* Contains the URL of the Up1 client. */
                up1Host: UP1_FILE_HOST,
                /* Contains the API key used for transactions with the Up1 host. */
                up1ApiKey: UP1_FILE_HOST_API_KEY,
                /* Current Version. */
                version: _self.getVersion(),
            };
        }

        /**
         * @private
         * @desc Checks if the configuration file exists.
         * @returns {boolean} Returns true if the configuration file exists.
         */
        static _configExists() {
            /* Attempt to parse the configuration file. */
            let data = bdPluginStorage.get( _self.getName(), 'config' );

            /* The returned data must be defined and non-empty. */
            return data && data !== null && data !== '';
        }

        /**
         * @private
         * @desc Loads the configuration file from `DiscordCrypt.config.json` and
         *      adds or removes any properties required.
         * @returns {boolean}
         */
        static _loadConfig() {
            _discordCrypt.log( 'Loading configuration file ...' );

            /* Attempt to parse the configuration file. */
            let config = bdPluginStorage.get( _self.getName(), 'config' );

            /* Check if the config file exists. */
            if ( !config || config === null || config === '' ) {
                /* File doesn't exist, create a new one. */
                _configFile = _discordCrypt._getDefaultConfig();

                /* Save the config. */
                this._saveConfig();

                /* Nothing further to do. */
                return true;
            }

            try {
                /* Try parsing the decrypted data. */
                _configFile = JSON.parse(
                    _discordCrypt.__zlibDecompress(
                        _discordCrypt.__aes256_decrypt_gcm( config.data, _masterPassword, 'PKC7', 'base64', false ),
                        'base64',
                        'utf8'
                    )
                );
            }
            catch ( err ) {
                _discordCrypt.log( `Decryption of configuration file failed - ${err}`, 'error' );
                return false;
            }

            /* If it fails, return an error. */
            if ( !_configFile || !_configFile.version ) {
                _discordCrypt.log( 'Decryption of configuration file failed.', 'error' );
                return false;
            }

            /* Try checking for each property within the config file and make sure it exists. */
            let defaultConfig = _discordCrypt._getDefaultConfig(), needs_save = false;

            /* Iterate all defined properties in the default configuration file. */
            for ( let prop in defaultConfig ) {
                /* If the defined property doesn't exist in the current configuration file ... */
                if (
                    !_configFile.hasOwnProperty( prop ) ||
                    (
                        typeof _configFile[ prop ] !== typeof defaultConfig[ prop ] &&
                        !Array.isArray( defaultConfig[ prop ] )
                    )
                ) {
                    /* Use the default. */
                    _configFile[ prop ] = defaultConfig[ prop ];

                    /* Show a simple log. */
                    _discordCrypt.log(
                        `Default value added for missing property '${prop}' in the configuration file.`
                    );

                    /* Set the flag for saving. */
                    needs_save = true;
                }
            }

            /* Iterate all defined properties in the current configuration file and remove any undefined ones. */
            for ( let prop in _configFile ) {
                /* If the default configuration doesn't contain this property, delete it as it's unnecessary. */
                if ( !defaultConfig.hasOwnProperty( prop ) ) {
                    /* Delete the property. */
                    delete _configFile[ prop ];

                    /* Show a simple log. */
                    _discordCrypt.log( `Removing unknown property '${prop}' from the configuration file.` );

                    /* Set the flag for saving. */
                    needs_save = true;
                }
            }

            /* Check for version mismatch. */
            if ( _configFile.version !== _self.getVersion() ) {
                /* Preserve the old version for logging. */
                let oldVersion = _configFile.version;

                /* Preserve the old password list before updating. */
                let oldCache = _configFile.channels;

                /* Get the most recent default configuration. */
                _configFile = _discordCrypt._getDefaultConfig();

                /* Now restore the password list. */
                _configFile.channels = oldCache;

                /* Set the flag for saving. */
                needs_save = true;

                /* Alert. */
                _discordCrypt.log( `Updated plugin version from v${oldVersion} to v${_self.getVersion()}.` );
            }

            /* Save the configuration file if necessary. */
            if ( needs_save )
                this._saveConfig();

            _discordCrypt.log( `Loaded configuration file! - v${_configFile.version}` );

            return true;
        }

        /**
         * @private
         * @desc Saves the configuration file with the current password using AES-256 in GCM mode.
         */
        static _saveConfig() {
            /* Encrypt the message using the master password and save the encrypted data. */
            bdPluginStorage.set( _self.getName(), 'config', {
                data:
                    _discordCrypt.__aes256_encrypt_gcm(
                        _discordCrypt.__zlibCompress(
                            JSON.stringify( _configFile ),
                            'utf8'
                        ),
                        _masterPassword,
                        'PKC7',
                        false
                    )
            } );
        }

        /**
         * @private
         * @desc Updates and saves the configuration data used and updates a given button's text.
         * @param {Object} [btn] The jQuery button to set the update text for.
         */
        static _saveSettings( btn ) {
            /* Save the configuration file. */
            _discordCrypt._saveConfig();

            if( btn ) {
                /* Tell the user that their settings were applied. */
                btn.text( 'Saved & Applied!' );

                /* Reset the original text after a second. */
                setTimeout( ( function () {
                    btn.text( 'Save & Apply' );
                } ), 1000 );
            }
        }

        /**
         * @private
         * @desc Resets the default configuration data used and updates a given button's text.
         * @param {Object} [btn] The jQuery button to set the update text for.
         */
        static _resetSettings( btn ) {
            /* Preserve the old password list before resetting. */
            let oldCache = _configFile.channels;

            /* Retrieve the default configuration. */
            _configFile = _discordCrypt._getDefaultConfig();

            /* Restore the old passwords. */
            _configFile.channels = oldCache;

            /* Save the configuration file to update any settings. */
            _discordCrypt._saveConfig();

            if( btn ) {
                /* Tell the user that their settings were reset. */
                btn.text( 'Restored Default Settings!' );

                /* Reset the original text after a second. */
                setTimeout( ( function () {
                    btn.text( 'Reset Settings' );
                } ), 1000 );
            }
        }

        /**
         * @private
         * @desc Update the current password field and save the config file.
         * @property {string} primary The primary password.
         * @property {string} secondary The secondary password.
         */
        static _updatePasswords( primary, secondary ) {
            /* Don't save if the password overlay is not open. */
            if ( $( '#dc-overlay-password' ).css( 'display' ) !== 'block' )
                return;

            let id = _discordCrypt._getChannelId();

            /* Check if a primary & secondary password has actually been entered. */
            if ( !primary || !primary.length || !secondary || !secondary.length ) {
                _configFile.channels[ id ].primaryKey =
                    _configFile.channels[ id ].secondaryKey = null;

                /* Disable auto-encrypt for that channel */
                _discordCrypt._setAutoEncrypt( false );
            }
            else {
                /* Update the password field for this id. */
                _configFile.channels[ id ].primaryKey = primary;
                _configFile.channels[ id ].secondaryKey = secondary;

                /* Enable auto-encrypt for the channel */
                _discordCrypt._setAutoEncrypt( true );
            }

            /* Save the configuration file and decode any messages. */
            _discordCrypt._saveConfig();
        }

        /* ========================================================= */

        /* ==================== MAIN CALLBACKS ==================== */

        /**
         * @private
         * @desc Ensures the client starts up on a non-channel location for proper functioning.
         *      If the user is not on a whitelisted channel, the plugin will alert them then
         *          force-reload the Electron application.
         * @return {boolean} Returns true if the location is correct.
         */
        static _ensureProperStartup() {
            const electron = require( 'electron' );

            /* Due to how BD loads the client, we need to start on a non-channel page to properly hook events. */
            if( [ '/channels/@me', '/activity', '/library', '/store' ].indexOf( window.location.pathname ) === -1 ) {
                /* Send a synchronous alert to indicate the importance of this. */
                electron.ipcRenderer.sendSync(
                    'ELECTRON_BROWSER_WINDOW_ALERT',
                    `It seems that Discord has not been loaded on the Games or Friends tab.\n` +
                    `DiscordCrypt requires Discord to load on the Games or Friends tab to work correctly.\n` +
                    `I'll reload the client once you click OK so that it starts on the correct tab.\n\n` +
                    `\tPath: ${window.location.pathname}`,
                    'DiscordCrypt FATAL ERROR'
                );

                /* Relaunch the app completely. */
                electron.remote.app.relaunch();
                electron.remote.app.exit();

                return false;
            }

            return true;
        }

        /**
         * @private
         * @desc Loads the master-password unlocking prompt.
         */
        static _loadMasterPassword() {
            if ( $( '#dc-master-overlay' ).length !== 0 )
                return;

            /* Check if the database exists. */
            const cfg_exists = _discordCrypt._configExists();

            const action_msg = cfg_exists ? 'Unlock Database' : 'Create Database';

            /* Construct the password updating field. */
            $( document.body ).prepend( _discordCrypt.__zlibDecompress( UNLOCK_HTML ) );

            const pwd_field = $( '#dc-db-password' );
            const unlock_btn = $( '#dc-unlock-database-btn' );
            const master_header_message = $( '#dc-header-master-msg' );
            const master_prompt_message = $( '#dc-prompt-master-msg' );

            /* Use these messages based on whether we're creating a database or unlocking it. */
            master_header_message.text(
                cfg_exists ?
                    '---------- Database Is Locked ----------' :
                    '---------- Database Not Found ----------'
            );
            master_prompt_message.text(
                cfg_exists ?
                    'Enter Password:' :
                    'Enter New Password:'
            );
            unlock_btn.text( action_msg );

            /* Force the database element to load. */
            document.getElementById( 'dc-master-overlay' ).style.display = 'block';

            /* Check for ENTER key press to execute unlocks. */
            pwd_field.on( "keydown", ( e => {
                let code = e.keyCode || e.which;

                /* Execute on ENTER/RETURN only. */
                if ( code !== 13 )
                    return;

                unlock_btn.click();
            } ) );

            /* Handle unlock button clicks. */
            unlock_btn.click(
                _discordCrypt._onMasterUnlockButtonClicked(
                    unlock_btn,
                    cfg_exists,
                    pwd_field,
                    action_msg
                )
            );
        }

        /**
         * @private
         * @desc Performs an async update checking and handles actually updating the current version if necessary.
         */
        static _checkForUpdates() {
            const update_check_btn = $( '#dc-update-check-btn' );

            try {

                /* Sanity check in case this isn't defined yet. */
                if( update_check_btn.length ) {
                    /* Update the checking button. */
                    update_check_btn.attr( 'disabled', true );
                    update_check_btn.text( 'Checking For Updates ...' );
                }

                /* Perform the update check. */
                _discordCrypt._checkForUpdate(
                    ( info ) => {

                        /* Sanity check in case this isn't defined yet. */
                        if( update_check_btn.length ) {
                            /* Reset the update check button if necessary. */
                            update_check_btn.attr( 'disabled', false );
                            update_check_btn.text( 'Check For Updates' );
                        }

                        /* Make sure an update was received. */
                        if( !info )
                            return;

                        /* Alert the user of the update and changelog. */
                        $( '#dc-overlay' ).css( 'display', 'block' );
                        $( '#dc-overlay-update' ).css( 'display', 'block' );

                        /* Update the version info. */
                        $( '#dc-new-version' ).text(
                            `New Version: ${info.version === '' ? 'N/A' : info.version} ` +
                            `( #${info.hash.slice( 0, 16 )} - ` +
                            `Update ${info.valid ? 'Verified' : 'Contains Invalid Signature. BE CAREFUL'}! )`
                        );
                        $( '#dc-old-version' ).text( `Current Version: ${_self.getVersion()} ` );

                        /* Update the changelog. */
                        let dc_changelog = $( '#dc-changelog' );
                        dc_changelog.val(
                            typeof info.changelog === "string" && info.changelog.length > 0 ?
                                _discordCrypt.__tryParseChangelog( info.changelog, _self.getVersion() ) :
                                'N/A'
                        );

                        /* Scroll to the top of the changelog. */
                        dc_changelog.scrollTop( 0 );

                        /* Store the update information in the upper scope. */
                        _updateData = info;
                    },
                    _configFile.blacklistedUpdates
                );
            }
            catch ( ex ) {
                _discordCrypt.log( ex, 'warn' );
            }
        }

        /**
         * @private
         * @desc Inserts the plugin's option toolbar to the current toolbar and handles all triggers.
         */
        static _loadToolbar() {

            /* Skip if the configuration hasn't been loaded. */
            if ( !_configFile )
                return;

            /* Skip if we're not in an active channel. */
            if ( _discordCrypt._getChannelId() === '@me' )
                return;

            /* Add toolbar buttons and their icons if it doesn't exist. */
            if ( $( '#dc-toolbar' ).length !== 0 )
                return;

            /* Inject the toolbar. */
            $( _self._searchUiClass )
                .parent()
                .parent()
                .parent()
                .prepend( _discordCrypt.__zlibDecompress( TOOLBAR_HTML ) );

            /* Cache jQuery results. */
            let dc_passwd_btn = $( '#dc-passwd-btn' ),
                dc_lock_btn = $( '#dc-lock-btn' ),
                dc_svg = $( '.dc-svg' ),
                lock_tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

            /* Set the SVG button class. */
            dc_svg.attr( 'class', 'dc-svg' );

            /* Set the initial status icon. */
            if ( dc_lock_btn.length > 0 ) {
                if ( _discordCrypt._getAutoEncrypt() ) {
                    dc_lock_btn.html( Buffer.from( LOCK_ICON, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( lock_tooltip.text( 'Disable Message Encryption' ) );
                }
                else {
                    dc_lock_btn.html( Buffer.from( UNLOCK_ICON, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( lock_tooltip.text( 'Enable Message Encryption' ) );
                }

                /* Set the button class. */
                dc_svg.attr( 'class', 'dc-svg' );
            }

            /* Inject the settings. */
            $( document.body ).prepend( _discordCrypt.__zlibDecompress( MENU_HTML ) );

            /* Also by default, set the about tab to be shown. */
            _discordCrypt._setActiveSettingsTab( 0 );
            _discordCrypt._setActiveExchangeTab( 0 );

            /* Update all settings from the settings panel. */
            $( '#dc-secondary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );
            $( '#dc-primary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
            $( '#dc-auto-accept-keys' ).prop( 'checked', _configFile.autoAcceptKeyExchanges );
            $( '#dc-settings-cipher-mode' ).val( _configFile.encryptBlockMode.toLowerCase() );
            $( '#dc-settings-padding-mode' ).val( _configFile.paddingMode.toLowerCase() );
            $( '#dc-settings-encrypt-trigger' ).val( _configFile.encodeMessageTrigger );
            $( '#dc-settings-timed-expire' ).val( _configFile.timedMessageExpires );
            $( '#dc-settings-decrypted-prefix' ).val( _configFile.decryptedPrefix );
            $( '#dc-settings-default-pwd' ).val( _configFile.defaultPassword );
            $( '#dc-settings-exchange-mode' ).val( _configFile.exchangeBitSize );

            /* Handle clipboard upload button. */
            $( '#dc-clipboard-upload-btn' ).click( _discordCrypt._onUploadEncryptedClipboardButtonClicked );

            /* Handle file button clicked. */
            $( '#dc-file-btn' ).click( _discordCrypt._onFileMenuButtonClicked );

            /* Handle alter file path button. */
            $( '#dc-select-file-path-btn' ).click( _discordCrypt._onChangeFileButtonClicked );

            /* Handle file upload button. */
            $( '#dc-file-upload-btn' ).click( _discordCrypt._onUploadFileButtonClicked );

            /* Handle file button cancelled. */
            $( '#dc-file-cancel-btn' ).click( _discordCrypt._onCloseFileMenuButtonClicked );

            /* Handle Settings tab opening. */
            $( '#dc-settings-btn' ).click( _discordCrypt._onSettingsButtonClicked );

            /* Handle Plugin Settings tab selected. */
            $( '#dc-plugin-settings-btn' ).click( _discordCrypt._onSettingsTabButtonClicked );

            /* Handle Database Settings tab selected. */
            $( '#dc-database-settings-btn' ).click( _discordCrypt._onDatabaseTabButtonClicked );

            /* Handle Security Settings tab selected. */
            $( '#dc-security-settings-btn' ).click( _discordCrypt._onSecurityTabButtonClicked );

            /* Handle About tab selected. */
            $( '#dc-about-settings-btn' ).click( _discordCrypt._onAboutTabButtonClicked );

            /* Handle Automatic Updates button clicked. */
            $( '#dc-automatic-updates-enabled' ).change( _discordCrypt._onAutomaticUpdateCheckboxChanged );

            /* Handle checking for updates. */
            $( '#dc-update-check-btn' ).click( _discordCrypt._onCheckForUpdatesButtonClicked );

            /* Handle Database Import button. */
            $( '#dc-import-database-btn' ).click( _discordCrypt._onImportDatabaseButtonClicked );

            /* Handle Database Export button. */
            $( '#dc-export-database-btn' ).click( _discordCrypt._onExportDatabaseButtonClicked );

            /* Handle Clear Database Entries button. */
            $( '#dc-erase-entries-btn' ).click( _discordCrypt._onClearDatabaseEntriesButtonClicked );

            /* Handle Settings tab closing. */
            $( '#dc-exit-settings-btn' ).click( _discordCrypt._onSettingsCloseButtonClicked );

            /* Handle Save settings. */
            $( '#dc-settings-save-btn' ).click( _discordCrypt._onSaveSettingsButtonClicked );

            /* Handle Reset settings. */
            $( '#dc-settings-reset-btn' ).click( _discordCrypt._onResetSettingsButtonClicked );

            /* Handle Restart-Now button clicking. */
            $( '#dc-restart-now-btn' ).click( _discordCrypt._onUpdateRestartNowButtonClicked );

            /* Handle Restart-Later button clicking. */
            $( '#dc-restart-later-btn' ).click( _discordCrypt._onUpdateRestartLaterButtonClicked );

            /* Handle Ignore-Update button clicking. */
            $( '#dc-ignore-update-btn' ).click( _discordCrypt._onUpdateIgnoreButtonClicked );

            /* Quickly generate and send a public key. */
            $( '#dc-quick-exchange-btn' ).click( _discordCrypt._onQuickHandshakeButtonClicked );

            /* Show the overlay when clicking the password button. */
            dc_passwd_btn.click( _discordCrypt._onOpenPasswordMenuButtonClicked );

            /* Update the password for the user once clicked. */
            $( '#dc-save-pwd' ).click( _discordCrypt._onSavePasswordsButtonClicked );

            /* Reset the password for the user to the default. */
            $( '#dc-reset-pwd' ).click( _discordCrypt._onResetPasswordsButtonClicked );

            /* Hide the overlay when clicking cancel. */
            $( '#dc-cancel-btn' ).click( _discordCrypt._onClosePasswordMenuButtonClicked );

            /* Copy the current passwords to the clipboard. */
            $( '#dc-cpy-pwds-btn' ).click( _discordCrypt._onCopyCurrentPasswordsButtonClicked );

            /* Ask the user about their password generation preferences. */
            $( '#dc-generate-password-btn' ).click( _discordCrypt._onGeneratePassphraseClicked );

            /* Set whether auto-encryption is enabled or disabled. */
            dc_lock_btn.click( _discordCrypt._onForceEncryptButtonClicked );
        }

        /**
         * @private
         * @desc Initializes additional threads needed for purging old data.
         */
        static _initGarbageCollector() {
            /* Set up the garbage collector. */
            _garbageCollectorInterval = setInterval( () => {
                /* Get the current time. */
                let now = Date.now();

                /* Remove all expired exchange entries. */
                for( let i in _globalSessionState ) {
                    /* Sanity check. */
                    if( !_globalSessionState[ i ].initiateTime )
                        continue;

                    /* Check if the exchange has expired. */
                    if( ( now - _globalSessionState[ i ].initiateTime ) > KEY_IGNORE_TIMEOUT ) {
                        /* Remove the entry. */
                        delete _globalSessionState[ i ];

                        /* Alert. */
                        global.smalltalk.alert(
                            'KEY EXCHANGE EXPIRED',
                            `The key exchange for the channel "${i}" has expired. Please retry again.`
                        );
                    }
                }

                /* Skip if the nonce is generate isn't found. */
                if( typeof _cachedModules.NonceGenerator.extractTimestamp !== 'function' ) {
                    _discordCrypt.log(
                        'Cannot clean expired key exchanges because a module couldn\'t be found.',
                        'warn'
                    );
                    return;
                }

                /* Iterate all channels stored. */
                for( let i in _configFile.channels ) {
                    /* Iterate all IDs being ignored. */
                    for( let id of _configFile.channels[ i ].ignoreIds ) {
                        /* Check when the message was sent. . */
                        let diff_milliseconds = now - _cachedModules.NonceGenerator.extractTimestamp( id );

                        /* Delete the entry if it's greater than the ignore timeout. */
                        if( diff_milliseconds < 0 || diff_milliseconds > KEY_IGNORE_TIMEOUT ) {
                            /* Quickly log. */
                            _discordCrypt.log( `Deleting old key exchange message "${id}"` );

                            /* Remove the entry. */
                            delete _configFile.channels[ i ].ignoreIds[
                                _configFile.channels[ i ].ignoreIds.indexOf( id )
                            ];

                            /* Try deleting the message. It won't be deleted if we didn't send it. */
                            try {
                                /* Delete the message. This will be queued if a rate limit is in effect. */
                                _discordCrypt._deleteMessage( i, id, _cachedModules );
                            }
                            catch ( e ) {
                                /* We can safely ignore this. */
                            }
                        }
                    }

                    /* Remove all empty entries. */
                    _configFile.channels[ i ].ignoreIds = _configFile.channels[ i ].ignoreIds.filter( e => e );
                }

                /* Update the configuration to the disk. */
                _discordCrypt._saveConfig();

            }, 10000 );

            /* Setup the timed message handler to trigger every 5 seconds. */
            _timedMessageInterval = setInterval( () => {
                /* Get the current time. */
                let now = Date.now();

                /* Loop over each message. */
                _configFile.timedMessages.forEach( ( e, i ) => {
                    /* Skip invalid elements. */
                    if ( !e || !e.expireTime ) {
                        /* Delete the index. */
                        _configFile.timedMessages.splice( i, 1 );

                        /* Update the configuration to the disk. */
                        _discordCrypt._saveConfig();
                    }

                    /* Only continue if the message has been expired. */
                    if ( e.expireTime < now ) {
                        /* Quickly log. */
                        _discordCrypt.log( `Deleting timed message "${_configFile.timedMessages[ i ].messageId}"` );

                        try {
                            /* Delete the message. This will be queued if a rate limit is in effect. */
                            _discordCrypt._deleteMessage( e.channelId, e.messageId, _cachedModules );
                        }
                        catch ( e ) {
                            /* Log the error that occurred. */
                            _discordCrypt.log( `${e.messageId}: ${e.toString()}`, 'warn' );
                        }

                        /* Delete the index. */
                        _configFile.timedMessages.splice( i, 1 );

                        /* Update the configuration to the disk. */
                        _discordCrypt._saveConfig();
                    }
                } );

            }, 5000 );
        }

        /**
         * @private
         * @desc Sets up the hooking methods required for plugin functionality.
         */
        static _hookSetup() {
            /* Scan for any existing method hooks. */
            if( !global.discordCrypt__hooked ) {
                /* Hooks can only be done once. Define a global property that indicates this. */
                global.discordCrypt__hooked = {};
                _Object.freeze( global.discordCrypt__hooked );
            }
            else {
                /* Reload since we need fresh hooks. */
                window.location.pathname = '/channels/@me';
                return;
            }

            try {
                /* Get module searcher for caching. */
                const searcher = _discordCrypt._getWebpackModuleSearcher();

                /* Resolve and cache all modules needed. */
                _cachedModules = {
                    NonceGenerator: searcher
                        .findByUniqueProperties( [ "extractTimestamp", "fromTimestamp" ] ),
                    MessageCreator: searcher
                        .findByUniqueProperties( [ "createMessage", "parse", "unparse" ] ),
                    MessageController: searcher
                        .findByUniqueProperties( [ "sendClydeError", "sendBotMessage" ] ),
                    GlobalTypes: searcher
                        .findByUniqueProperties( [ "ActionTypes", "ActivityTypes" ] ),
                    EventDispatcher: searcher
                        .findByUniqueProperties( [ "dispatch", "maybeDispatch", "dirtyDispatch" ] ),
                    MessageQueue: searcher
                        .findByUniqueProperties( [ "enqueue", "handleSend", "handleResponse" ] ),
                    UserStore: searcher
                        .findByUniqueProperties( [ "getUser", "getUsers", "findByTag", 'getCurrentUser' ] ),
                    GuildStore: searcher
                        .findByUniqueProperties( [ "getGuild", "getGuilds" ] ),
                    ChannelStore: searcher
                        .findByUniqueProperties( [ "getChannel", "getChannels", "getDMFromUserId", 'getDMUserIds' ] ),
                };

                /* Throw an error if a cached module can't be found. */
                for ( let prop in _cachedModules ) {
                    if ( typeof _cachedModules[ prop ] !== 'object' ) {
                        global.smalltalk.alert(
                            'Error Loading DiscordCrypt',
                            `Could not find requisite module: ${prop}`
                        );
                        return;
                    }
                }

                /* Hook switch events as the main event processor. */
                if ( !_discordCrypt._hookMessageCallbacks() ) {
                    global.smalltalk.alert( 'Error Loading DiscordCrypt', `Failed to hook the required modules.` );
                    return;
                }

                /* Patch emoji selection to force it to be enabled for full-encryption messages. */
                _discordCrypt._monkeyPatch(
                    searcher.findByUniqueProperties( [ 'isEmojiDisabled' ] ),
                    'isEmojiDisabled',
                    {
                        instead: ( patchData ) => {
                            try {
                                if(
                                    _discordCrypt._getChannelId() === patchData.methodArguments[ 1 ].id &&
                                    _discordCrypt._hasCustomPassword( patchData.methodArguments[ 1 ].id ) &&
                                    _discordCrypt._getAutoEncrypt()
                                )
                                    return false;
                            }
                            catch( e ) {
                                /* Ignore. */
                            }

                            return patchData.callOriginalMethod();
                        }
                    }
                );

                /* Request the image resolver. */
                let ImageResolver = searcher.findByUniqueProperties( [ 'getImageSrc', 'getSizedImageSrc' ] );

                /* Patch methods responsible for retrieving images to allow passing data URLs for attachments. */
                const ImageDataSrcPatch = ( patchData ) => {
                    if(
                        patchData.methodArguments[ 0 ] &&
                        patchData.methodArguments[ 0 ].indexOf( 'data:' ) === 0
                    )
                        patchData.returnValue = patchData.methodArguments[ 0 ];
                };
                _discordCrypt._monkeyPatch( ImageResolver, 'getImageSrc', { after: ImageDataSrcPatch } );
                _discordCrypt._monkeyPatch( ImageResolver, 'getSizedImageSrc', { after: ImageDataSrcPatch } );
            }
            catch( e ) {
                _discordCrypt.log( 'Could not hook the required methods. If this is a test, that\'s fine.', 'warn' );
            }
        }

        /**
         * @private
         * @desc Hook Discord's internal event handlers for message decryption.
         * @return {boolean} Returns true if handler events have been hooked.
         */
        static _hookMessageCallbacks() {
            /* Hook the event dispatchers. */
            _discordCrypt._monkeyPatch(
                _cachedModules.EventDispatcher,
                'dispatch',
                { instead: _discordCrypt._onDispatchEvent }
            );

            /* Hook the outgoing message queue handler to encrypt messages & save the original enqueue. */
            _cachedModules.MessageQueue.original_enqueue = _discordCrypt._monkeyPatch(
                _cachedModules.MessageQueue,
                'enqueue',
                { instead: _discordCrypt._onOutgoingMessage }
            ).original;

            /* Hook CHANNEL_SWITCH for toolbar and menu reloading. */
            _eventHooks.push( { type: 'CHANNEL_SELECT', callback: _discordCrypt._onChannelSwitched } );

            /* Hook MESSAGE_CREATE function for single-load messages. */
            _eventHooks.push( { type: 'MESSAGE_CREATE', callback: _discordCrypt._onIncomingMessage } );

            /* Hook MESSAGE_UPDATE function for single-edited messages. */
            _eventHooks.push( { type: 'MESSAGE_UPDATE', callback: _discordCrypt._onIncomingMessage } );

            /* Hook LOAD_MESSAGES_SUCCESS function for bulk-messages. */
            _eventHooks.push( { type: 'LOAD_MESSAGES_SUCCESS', callback: _discordCrypt._onIncomingMessages } );

            /* Hook LOAD_MESSAGES_AROUND_SUCCESS for location-jumping decryption.  */
            _eventHooks.push( { type: 'LOAD_MESSAGES_AROUND_SUCCESS', callback: _discordCrypt._onIncomingMessages } );

            /* Hook LOAD_RECENT_MENTIONS_SUCCESS which is required to decrypt mentions. */
            _eventHooks.push( { type: 'LOAD_RECENT_MENTIONS_SUCCESS', callback: _discordCrypt._onIncomingMessages } );

            /* Hook LOAD_PINNED_MESSAGES_SUCCESS for searching encrypted messages. */
            _eventHooks.push( { type: 'LOAD_PINNED_MESSAGES_SUCCESS', callback: _discordCrypt._onIncomingMessages } );

            return true;
        }

        /**
         * @private
         * @desc The event handler that fires whenever a new event occurs in Discord.
         *      This can be called multiple times for a single event since this hooks:
         *          dispatch, maybeDispatch and dirtyDispatch.
         * @param {Object} event The event that occurred.
         */
        static _onDispatchEvent( event ) {
            let handled = false;

            try {
                /* Check if a handler exists for the event type and call it. */
                for( let i = 0; i < _eventHooks.length; i++ )
                    if( event.methodArguments[ 0 ].type === _eventHooks[ i ].type ) {
                        _eventHooks[ i ].callback( event );
                        handled = true;
                    }
            }
            catch( e ) {
                /* Ignore. */
            }

            /* If not handled by a hook, assume the position! ( Pun intended. ) */
            if( !handled )
                event.callOriginalMethod();
        }

        /**
         * @private
         * @desc The event handler that fires when a channel is switched.
         * @param {Object} event The channel switching event object.
         */
        static _onChannelSwitched( event ) {
            let id = event.methodArguments[ 0 ].channelId;

            /* Skip channels not currently selected. */
            if ( _discordCrypt._getChannelId() === id ) {
                /* Checks if channel has any settings. */
                if( _configFile && !_configFile.channels[ id ] ) {

                    /* Create the defaults. */
                    _configFile.channels[ id ] = {
                        primaryKey: null,
                        secondaryKey: null,
                        autoEncrypt: true,
                        ignoreIds: []
                    };
                }

                /* Delays are required due to windows being loaded async. */
                setTimeout(
                    () => {
                        /* Update the lock icon since it is local to the channel */
                        _discordCrypt._updateLockIcon( _self );

                        /* Add the toolbar. */
                        _discordCrypt._loadToolbar();
                    },
                    1
                );
            }

            /* Call the original method. */
            event.callOriginalMethod();
        }

        /**
         * @private
         * @desc The event handler that fires when an incoming message is received.
         * @param {Object} event The message event object.
         * @return {Promise<void>}
         */
        static _onIncomingMessage( event ) {
            /* Pretend no message was received till the configuration is unlocked. */
            ( async () => {
                /* Wait for the configuration file to be loaded. */
                while( !_configFile )
                    await ( new Promise( r => setTimeout( r, 1000 ) ) );

                /* Update the original object with any applicable changes. */
                event.methodArguments[ 0 ].message = _discordCrypt._decryptMessage(
                    event.methodArguments[ 0 ].channelId || event.methodArguments[ 0 ].message.channel_id,
                    event.methodArguments[ 0 ].message
                );

                /* Check if any file upload links are present in the decrypted content. */
                let attachments = _discordCrypt.__up1ExtractValidUp1URLs( event.methodArguments[ 0 ].message.content );

                /* Call the original method if we don't need to download and decrypt any files. . */
                if( !attachments.length )
                    event.originalMethod.apply( event.thisObject, event.methodArguments );

                /* Resolve each attachment. We only do this for messages that can be viewed to save bandwidth. */
                let resolvedCount = 0;
                for( let i = 0; i < attachments.length; i++ ) {
                    /* Slice off the seed. */
                    let seed = attachments[ i ]
                        .split( `${_configFile.up1Host}/#` )
                        .join( '' )
                        .split( `|${_configFile.encodeMessageTrigger}` )[ 0 ];

                    /* Download and decrypt the blob. */
                    ( async function() {
                        await _discordCrypt.__up1DecryptDownload(
                            seed,
                            _configFile.up1Host,
                            global.sjcl,
                            ( result ) => {
                                /* Bail on error. */
                                if( typeof result !== 'object' ) {
                                    resolvedCount += 1;
                                    return;
                                }

                                /* Build the attachment. */
                                let attachment = {
                                    id: _discordCrypt._getNonce(),
                                    filename: result.header.name,
                                    size: result.blob.size,
                                    url: attachments[ i ],
                                };

                                /* If the attachment is an image, get the width and height of it. */
                                if( result.header.mime.indexOf( 'image/' ) !== -1 ) {
                                    /* Create a new DataURL image to extract the dimensions from. */
                                    let img = new Image();
                                    img.src = `data:${result.header.mime};base64,${result.data.toString( 'base64' )}`;

                                    /* Store the dimensions. */
                                    attachment.width = img.width;
                                    attachment.height = img.height;

                                    /* Convert to a compatible data URL. */
                                    attachment.url = img.src;
                                }

                                /* Create a new attachment object or add it to the existing array. */
                                if( !event.methodArguments[ 0 ].message.attachments )
                                    event.methodArguments[ 0 ].message.attachments = [ attachment ];
                                else
                                    event.methodArguments[ 0 ].message.attachments.push( attachment );

                                /* Increment parsed count. */
                                resolvedCount += 1;
                            }
                        );
                    } )();
                }

                /* Wait till all attachments have been parsed. */
                while( resolvedCount !== attachments.length )
                    await ( new Promise( r => setTimeout( r, 1000 ) ) );

                /* Add the message to the list. */
                event.originalMethod.apply( event.thisObject, event.methodArguments );
            } )();
        }

        /**
         * @private
         * @desc The event handler that fires when a channel's messages are to be loaded.
         * @param {Object} event The channel loading event object.
         * @return {Promise<void>}
         */
        static _onIncomingMessages( event ) {
            /**
             * @type {string}
             */
            let id = event.methodArguments[ 0 ].channelId;
            /**
             * @type {Message[]}
             */
            let messages = event.methodArguments[ 0  ].messages;

            /* Pretend no message was received till the configuration is unlocked. */
            ( async () => {
                /* Wait for the configuration file to be loaded. */
                while ( !_configFile )
                    await ( new Promise( r => setTimeout( r, 1000 ) ) );

                /* Iterate all messages being received. */
                for ( let i = 0; i < messages.length; i++ ) {
                    /* Attempt to decrypt the message content. */
                    messages[ i ] = _discordCrypt._decryptMessage(
                        id,
                        messages[ i ]
                    );

                    /* Make sure the string has an actual length or pretend the message doesn't exist. */
                    if( !messages[ i ].content.length && !messages[ i ].embeds )
                        delete messages[ i ];
                }

                /* Filter out any deleted messages and apply any applicable updates. */
                event.methodArguments[ 0 ].messages = messages.filter( ( i ) => i );

                /* Call the original method using the modified contents. ( If any. ) */
                event.originalMethod.apply( event.thisObject, event.methodArguments );
            } )();
        }

        /**
         * @private
         * @desc The event handler that fires when an outgoing message is being sent.
         * @param {Object} event The outgoing message event object.
         * @return {Promise<void>}
         */
        static _onOutgoingMessage( event ) {
            let r, cR;

            ( async () => {
                /* Wait till the configuration file has been loaded before parsing any messages. */
                await ( async () => {
                    while( !_configFile )
                        await ( new Promise( r => setTimeout( r, 1000 ) ) );
                } )();

                /* Copy the message object to a variable for easier parsing. */
                let message = event.methodArguments[ 0 ].message;

                /* Try encrypting the message content. */
                cR = _discordCrypt._tryEncryptMessage( message.content, false, message.channelId );

                /* Apply the message content if valid. */
                if( typeof cR !== 'boolean' && cR.length > 0 )
                    message.content = cR[ 0 ].message;

                /* If this message contains an embed, try encrypting also. */
                if( message.embed ) {
                    /* If the message contains a description, encrypt it. */
                    if( message.embed.description ) {
                        r = _discordCrypt._tryEncryptMessage( message.embed.description, false, message.channelId );

                        /* If valid, apply the updated result. */
                        if( typeof r !== 'boolean' && r.length === 1 )
                            message.embed.description = r[ 0 ].message;
                    }

                    /* Try encrypting fields if present. */
                    for( let i = 0; message.embed.fields && i < message.embed.fields.length; i++ ) {
                        /* First encrypt the field name. */
                        r = _discordCrypt._tryEncryptMessage(
                            message.embed.fields[ i ].name,
                            false,
                            message.channelId
                        );

                        /* Apply the result if applicable. */
                        if( typeof r !== 'boolean' && r.length === 1 )
                            message.embed.fields[ i ].name = r[ 0 ].message;

                        /* Next encrypt the field value. */
                        r = _discordCrypt._tryEncryptMessage(
                            message.embed.fields[ i ].value,
                            false,
                            message.channelId
                        );

                        /* Apply the result if applicable. */
                        if( typeof r !== 'boolean' && r.length === 1 )
                            message.embed.fields[ i ].value = r[ 0 ].message;

                    }
                }

                /* Update the message object to reflect any changes. */
                event.methodArguments[ 0 ].message = message;

                /* Call the original dispatching method. */
                event.originalMethod.apply( event.thisObject, event.methodArguments );

                /* Dispatch any additional packets containing additional content. */
                if( cR.length !== 1 ) {
                    for( let i = 1; i < cR.length; i++ )
                        _discordCrypt._dispatchMessage( cR[ i ].message, message.channelId );
                }
            } )();
        }

        /**
         * @private
         * @desc Attempts to decrypt a message object with any encrypted content or embeds.
         * @param {string} id The channel ID of the message.
         * @param {Message} message The message object to decrypt.
         * @return {Message} Returns the passed message object with any decrypted content if applicable.
         */
        static _decryptMessage( id, message ) {
            /**
             * @desc Decrypts the message content specified, updates any mentioned users and returns the result.
             * @param {string} id The channel ID of the message being decrypted.
             * @param {string} content The content to decrypt.
             * @param {Message} message The message object.
             * @param {string} primary_key The primary key used for decryption.
             * @param {string} secondary_key The secondary key used for decryption.
             * @return {string|boolean} Returns the decrypted string on success or false on failure.
             * @private
             */
            const _decryptMessageContent = ( id, content, message, primary_key, secondary_key ) => {
                let r = _discordCrypt._parseMessage(
                    content,
                    message,
                    primary_key,
                    secondary_key,
                    _configFile.decryptedPrefix
                );

                /* Assign it to the object if valid. */
                if( typeof r === 'string' && r.length ) {
                    /* Calculate any mentions. */
                    let notifications = _discordCrypt._getMentionsForMessage( r, id );

                    /* Add any user mentions. */
                    if( notifications.mentions.length ) {
                        /* Append to the existing list if necessary. */
                        if( !message.mentions )
                            message.mentions = notifications.mentions;
                        else
                            message.mentions = message.mentions
                                .concat( notifications.mentions )
                                .filter( ( e, i, s ) => i === s.indexOf( e ) );
                    }

                    /* Add any role mentions. */
                    if( notifications.mention_roles.length ) {
                        /* Append to the existing list if necessary. */
                        if( !message.mention_roles )
                            message.mention_roles = notifications.mention_roles;
                        else
                            message.mention_roles = message.mention_roles
                                .concat( notifications.mention_roles )
                                .filter( ( e, i, s ) => i === s.indexOf( e ) );
                    }

                    /* Update the "@everyone" field if necessary. */
                    message.mention_everyone = message.mention_everyone || notifications.mention_everyone;
                }

                return r;
            };

            /* Use the default password for decryption if one hasn't been defined for this channel. */
            let primary_key = Buffer.from(
                _configFile.channels[ id ] && _configFile.channels[ id ].primaryKey ?
                    _configFile.channels[ id ].primaryKey :
                    _configFile.defaultPassword
            );
            let secondary_key = Buffer.from(
                _configFile.channels[ id ] && _configFile.channels[ id ].secondaryKey ?
                    _configFile.channels[ id ].secondaryKey :
                    _configFile.defaultPassword
            );

            /* Check if the content is in the valid format. */
            if( _discordCrypt._isFormattedMessage( message.content ) ) {
                /* Decrypt the content. */
                let r = _decryptMessageContent(
                    id,
                    message.content.substr( 1, message.content.length - 2 ),
                    message,
                    primary_key,
                    secondary_key
                );

                /* Update the content if necessary. */
                if( typeof r === 'string' )
                    message.content = r;
            }

            /* Parse any embed available. */
            for( let i = 0; message.embeds && i < message.embeds.length; i++ ) {
                /* Decrypt the description. */
                if(
                    message.embeds[ i ].description &&
                    _discordCrypt._isFormattedMessage( message.embeds[ i ].description )
                ) {
                    let r = _decryptMessageContent(
                        id,
                        message.embeds[ i ].description.substr( 1, message.embeds[ i ].description.length - 2 ),
                        message,
                        primary_key,
                        secondary_key
                    );

                    /* Apply on success. */
                    if( typeof r === 'string' )
                        message.embeds[ i ].description = r;
                }

                /* Decrypt any embed fields. */
                for( let j = 0; message.embeds[ i ].fields && j < message.embeds[ i ].fields.length; j++ ) {
                    /* Skip fields without formatted name. */
                    if( _discordCrypt._isFormattedMessage( message.embeds[ i ].fields[ j ].name ) ) {
                        /* Decrypt the name. */
                        let r = _decryptMessageContent(
                            id,
                            message.embeds[ i ].fields[ j ].name.substr(
                                1,
                                message.embeds[ i ].fields[ j ].name - 2
                            ),
                            message,
                            primary_key,
                            secondary_key
                        );

                        /* Apply on success. */
                        if( typeof r === 'string' )
                            message.embeds[ i ].fields[ j ].name = r;
                    }
                    /* Skip fields without formatted value. */
                    if( _discordCrypt._isFormattedMessage( message.embeds[ i ].fields[ j ].value ) ) {
                        /* Decrypt the name. */
                        let r = _decryptMessageContent(
                            id,
                            message.embeds[ i ].fields[ j ].value.substr(
                                1,
                                message.embeds[ i ].fields[ j ].value.length - 2
                            ),
                            message,
                            primary_key,
                            secondary_key
                        );

                        /* Apply on success. */
                        if( typeof r === 'string' )
                            message.embeds[ i ].fields[ j ].value = r;
                    }
                }
            }

            /* Return the ( possibly modified ) object. */
            return message;
        }

        /**
         * @private
         * @desc Updates the auto-encrypt toggle
         * @param {boolean} enable
         */
        static _setAutoEncrypt( enable ) {
            _configFile.channels[ _discordCrypt._getChannelId() ].autoEncrypt = enable;
        }

        /**
         * @private
         * @desc Returns whether or not auto-encrypt is enabled.
         * @param {string} [id] Optional channel ID to retrieve the status for.
         * @returns {boolean}
         */
        static _getAutoEncrypt( id ) {
            id = id || _discordCrypt._getChannelId();

            /* Quick sanity check. */
            if( !_configFile || !_configFile.channels[ id ] )
                return true;

            /* Fetch the current value. */
            return _configFile.channels[ id ].autoEncrypt;
        }

        /**
         * @private
         * @desc Determines if a custom password exists for the specified channel.
         * @param {string} channel_id The target channel's ID.
         * @return {boolean} Returns true if a custom password is set.
         */
        static _hasCustomPassword( channel_id ) {
            return _configFile.channels[ channel_id ] &&
                _configFile.channels[ channel_id ].primaryKey &&
                _configFile.channels[ channel_id ].secondaryKey;
        }

        /**
         * @private
         * @desc Detects and returns all roles & users mentioned in a message.
         *      Shamelessly "stolen" from BetterDiscord team. Thanks guys. :D
         * @param {string} message The input message.
         * @param {string} [id] The channel ID this message will be dispatched to.
         * @return {MessageMentions}
         */
        static _getMentionsForMessage( message, id ) {
            /* Patterns for capturing specific mentions. */
            const user_mentions = /<@!?([0-9]{10,24})>/g,
                role_mentions = /<@&([0-9]{10,24})>/g,
                everyone_mention = /(?:\s+|^)@everyone(?:\s+|$)/;

            /* Actual format as part of a message object. */
            let result = {
                mentions: [],
                mention_roles: [],
                mention_everyone: false
            };

            /* Get the channel's ID. */
            id = id || _discordCrypt._getChannelId();

            /* Get the channel's properties. */
            let props = _discordCrypt._getChannelProps( id );

            /* Check if properties were retrieved. */
            if( !props )
                return result;

            /* Parse the message into ID based format. */
            message = _cachedModules.MessageCreator.parse( props, message ).content;

            /* Check for user tags. */
            if( user_mentions.test( message ) ) {
                /* Retrieve all user IDs in the parsed message. */
                result.mentions = message
                    .match( user_mentions )
                    .map( m => {
                        return { id: m.replace( /[^0-9]/g, '' ) }
                    } );
            }

            /* Gather role mentions. */
            if( role_mentions.test( message ) ) {
                /* Retrieve all role IDs in the parsed message. */
                result.mention_roles = message.match( role_mentions ).map( m => m.replace( /[^0-9]/g, '' ) );
            }

            /* Detect if mentioning everyone. */
            result.mention_everyone = everyone_mention.test( message );

            return result;
        }

        /**
         * @private
         * @desc Handles a key exchange request that has been accepted.
         * @param {Message} message The input message object.
         * @param {PublicKeyInfo} remoteKeyInfo The public key's information.
         * @return {string} Returns the resulting message string.
         */
        static _handleAcceptedKeyRequest( message, remoteKeyInfo ) {
            let encodedKey, algorithm;

            /* If a local key doesn't exist, generate one and send it. */
            if(
                !_globalSessionState.hasOwnProperty( message.channel_id ) ||
                !_globalSessionState[ message.channel_id ].privateKey
            ) {
                /* Create the session object. */
                _globalSessionState[ message.channel_id ] = {};
                _globalSessionState[ message.channel_id ].initiateTime = Date.now();

                /* Generate a local key pair. */
                if( remoteKeyInfo.algorithm.toLowerCase() === 'dh' )
                    _globalSessionState[ message.channel_id ].privateKey =
                        _discordCrypt.__generateDH( remoteKeyInfo.bit_length );
                else
                    _globalSessionState[ message.channel_id ].privateKey =
                        _discordCrypt.__generateECDH( remoteKeyInfo.bit_length );

                /* Get the public key for this private key. */
                encodedKey = _discordCrypt.__encodeExchangeKey(
                    Buffer.from(
                        _globalSessionState[ message.channel_id ].privateKey.getPublicKey(
                            'hex',
                            remoteKeyInfo.algorithm.toLowerCase() === 'ecdh' ? 'compressed' : null
                        ),
                        'hex'
                    ),
                    remoteKeyInfo.index
                );

                /* Dispatch the public key. */
                _discordCrypt._dispatchMessage(
                    `\`${encodedKey}\``,
                    message.channel_id,
                    KEY_DELETE_TIMEOUT
                );

                /* Get the local key info. */
                _globalSessionState[ message.channel_id ].localKey = _discordCrypt.__extractExchangeKeyInfo(
                    encodedKey,
                    true
                );
            }

            /* Save the remote key's information. */
            _globalSessionState[ message.channel_id ].remoteKey = remoteKeyInfo;

            /* Extract the algorithm for later logging. */
            algorithm = `${_globalSessionState[ message.channel_id ].localKey.algorithm.toUpperCase()}-`;
            algorithm += `${_globalSessionState[ message.channel_id ].localKey.bit_length}`;

            /* Try deriving the key. */
            let keys = _discordCrypt._deriveExchangeKeys( message.channel_id );

            /* Remove the entry. */
            delete _globalSessionState[ message.channel_id ];

            /* Validate the keys. */
            if( !keys || !keys.primaryKey || !keys.secondaryKey ) {
                _discordCrypt.log(
                    `Failed to establish a session in channel: ${message.channel_id}`,
                    'error'
                );

                /* Display a message to the user. */
                return '🚫 **[ ERROR ]** FAILED TO ESTABLISH A SESSION !!!';
            }

            /* Apply the keys. */
            _configFile.channels[ message.channel_id ].primaryKey = keys.primaryKey;
            _configFile.channels[ message.channel_id ].secondaryKey = keys.secondaryKey;

            /* Save the configuration to update the keys and timed messages. */
            _discordCrypt._saveConfig();

            /* Set the new message text. */
            return '🔏 **[ SESSION ]** *ESTABLISHED NEW SESSION* !!!\n\n' +
                `Algorithm: **${algorithm}**\n` +
                `Primary Entropy: **${_discordCrypt.__entropicBitLength( keys.primaryKey )} Bits**\n` +
                `Secondary Entropy: **${_discordCrypt.__entropicBitLength( keys.secondaryKey )} Bits**\n`;
        }

        /**
         * @private
         * @desc Parses a public key message.
         * @param {Message} message The message object.
         * @param {string} content The message's content.
         * @returns {string} Returns a result string indicating the message info.
         */
        static _parseKeyMessage( message, content ) {
            /* Ignore messages that are older than 6 hours. */
            if( message.timestamp && ( Date.now() - ( new Date( message.timestamp ) ) ) > KEY_IGNORE_TIMEOUT )
                return '';

            /* Extract the algorithm info from the message's metadata. */
            let remoteKeyInfo = _discordCrypt.__extractExchangeKeyInfo( content, true );

            /* Sanity check for invalid key messages. */
            if ( remoteKeyInfo === null )
                return '🚫 **[ ERROR ]** `INVALID PUBLIC KEY !!!`';

            /* Validate functions. */
            // noinspection JSUnresolvedVariable
            if(
                !_cachedModules.UserStore ||
                typeof _cachedModules.UserStore.getCurrentUser !== 'function' ||
                typeof _cachedModules.UserStore.getUser !== 'function' ||
                typeof _cachedModules.ChannelStore.getChannels !== 'function'
            )
                return '🚫 **[ ERROR ]** `CANNOT RESOLVE DEPENDENCY MODULE !!!`';

            /* Make sure that this key wasn't somehow sent in a guild or group DM. */
            // noinspection JSUnresolvedFunction
            let channels = _cachedModules.ChannelStore.getChannels();
            if( channels && channels[ message.channel_id ] && channels[ message.channel_id ].type !== 1 )
                return '🚫 **[ ERROR ]** `INCOMING KEY EXCHANGE FROM A NON-DM !!!`';

            /* Retrieve the current user's information. */
            // noinspection JSUnresolvedFunction
            let currentUser = _cachedModules.UserStore.getCurrentUser(),
                remoteUser = _cachedModules.UserStore.getUser( message.author.id );

            /* Check if the key being received is in the ignore list and just make it invisible. */
            if(
                _configFile.channels[ message.channel_id ] &&
                _configFile.channels[ message.channel_id ].ignoreIds.indexOf( message.id ) !== -1
            )
                return '';

            /* Verify this message isn't coming from us. */
            if( message.author.id === currentUser.id ) {
                /* By default, we use the locally defined key to retrieve the information. */
                let k;

                /* If it is, ensure we have a private key for it. */
                if(
                    !_globalSessionState.hasOwnProperty( message.channel_id ) ||
                    !_globalSessionState[ message.channel_id ].privateKey
                ) {
                    /* This is a local public key that has already been ACK'd. We can ignore it. */
                    k = remoteKeyInfo;
                }
                else
                    k = _globalSessionState[ message.channel_id ].localKey;

                return '🔏 **[ SESSION ]** *OUTGOING KEY EXCHANGE*\n\n' +
                    `Algorithm: **${k.algorithm.toUpperCase()}-${k.bit_length}**\n` +
                    `Checksum: **${k.fingerprint}**`;
            }

            /* Be sure to add the message ID to the ignore list. */
            _configFile.channels[ message.channel_id ].ignoreIds.push( message.id );
            _discordCrypt._saveConfig();

            /* Check if this is an incoming key exchange or a resulting message. */
            if( _globalSessionState.hasOwnProperty( message.channel_id ) )
                return _discordCrypt._handleAcceptedKeyRequest( message, remoteKeyInfo );

            /* Check if we need to prompt. */
            if( _configFile.autoAcceptKeyExchanges )
                return _discordCrypt._handleAcceptedKeyRequest( message, remoteKeyInfo );

            /* Actually just the return string for the message. */
            let returnValue = '';

            /* The author is attempting to initiate a key exchange. Prompt the user on whether to accept it. */
            ( async function() {
                await global.smalltalk.confirm(
                    '----- INCOMING KEY EXCHANGE REQUEST -----',
                    `User @${remoteUser.username}#${remoteUser.discriminator} wants to perform a key exchange.` +
                    '\n\n' +
                    `Algorithm: ${remoteKeyInfo.algorithm.toUpperCase()}-${remoteKeyInfo.bit_length}` +
                    '\n' +
                    `Checksum: ${remoteKeyInfo.fingerprint}` +
                    '\n\n' +
                    'Do you wish to start a new secure session with them using these parameters?'
                ).then(
                    () => {
                        /* Make sure the key didn't expire by the time they accepted it. */
                        if( ( Date.now() - Date.parse( message.timestamp ) ) > KEY_IGNORE_TIMEOUT )
                            returnValue = '🚫 **[ ERROR ]** SESSION KEY EXPIRED';
                        else {
                            /* The user accepted the request. Handle the key exchange.  */
                            returnValue = _discordCrypt._handleAcceptedKeyRequest( message, remoteKeyInfo );
                        }
                    },
                    () => {
                        /* The user rejected the request. */
                        returnValue = '🔏 **[ INFO ]** *IGNORED EXCHANGE MESSAGE*';
                    }
                )
            } )();

            return returnValue;
        }

        /**
         * @private
         * @desc Parses a raw message and returns the decrypted result.
         * @param {string} content The message content to parse.
         * @param {Message} [message] The message object.
         * @param {string} primary_key The primary key used to decrypt the message.
         * @param {string} secondary_key The secondary key used to decrypt the message.
         * @param {string} [prefix] Messages that are successfully decrypted should have this prefix prepended.
         * @param {boolean} [allow_key_parsing] Whether to allow key exchange parsing.
         * @return {string|boolean} Returns false if a message isn't in the correct format or the decrypted result.
         */
        static _parseMessage( content, message, primary_key, secondary_key, prefix, allow_key_parsing = true ) {
            /* Skip if the message is <= size of the total header. */
            if ( content.length <= 12 )
                return false;

            /* Split off the magic. */
            let magic = content.slice( 0, 4 );

            /* If this is a public key, just add a button and continue. */
            if ( allow_key_parsing && magic === ENCODED_KEY_HEADER )
                return _discordCrypt._parseKeyMessage( message, content );

            /* Make sure it has the correct header. */
            if ( magic !== ENCODED_MESSAGE_HEADER )
                return false;

            /* Try to deserialize the metadata. */
            let metadata = _discordCrypt.__metaDataDecode( content.slice( 4, 8 ) );

            /* Try looking for an algorithm, mode and padding type. */
            /* Algorithm first. */
            if ( metadata[ 0 ] >= ENCRYPT_MODES.length )
                return false;

            /* Cipher mode next. */
            if ( metadata[ 1 ] >= ENCRYPT_BLOCK_MODES.length )
                return false;

            /* Padding after. */
            if ( metadata[ 2 ] >= PADDING_SCHEMES.length )
                return false;

            /* Decrypt the message. */
            let dataMsg = _discordCrypt.__symmetricDecrypt( content.replace( /\r?\n|\r/g, '' )
                .substr( 8 ), primary_key, secondary_key, metadata[ 0 ], metadata[ 1 ], metadata[ 2 ], true );

            /* If successfully decrypted, add the prefix if necessary and return the result. */
            if ( ( typeof dataMsg === 'string' || dataMsg instanceof String ) && dataMsg !== "" ) {
                /* If a prefix is being used, add it now. */
                if( prefix && typeof prefix === 'string' && prefix.length > 0 )
                    dataMsg = prefix + dataMsg;

                /* Return. */
                return dataMsg;
            }

            switch( dataMsg ) {
            case 1:
                return '🚫 **[ ERROR ]** `AUTHENTICATION OF CIPHER TEXT FAILED !!!`';
            case 2:
                return '🚫 **[ ERROR ]** `FAILED TO DECRYPT CIPHER TEXT !!!`';
            default:
                return '🚫 **[ ERROR ]** `DECRYPTION FAILURE. INVALID KEY OR MALFORMED MESSAGE !!!`';
            }
        }

        /**
         * @private
         * @desc Attempts to encrypt a message using the key from the channel ID provided.
         * @param {string} message The input message to encrypt.
         * @param {boolean} ignore_trigger Whether to ignore checking for Config::encodeMessageTrigger and
         *      always encrypt.
         * @param {string} channel_id The channel ID to send this message to.
         * @return {Array<{message: string}>|boolean} Returns one or multiple packets containing the encrypted text.
         *      Returns false on failure.
         */
        static _tryEncryptMessage( message, ignore_trigger, channel_id ) {
            /* Add the message signal handler. */
            const escapeCharacters = [ "/" ];
            const crypto = require( 'crypto' );

            let cleaned, id = channel_id || '0';

            /* Skip messages starting with pre-defined escape characters. */
            if ( message.substr( 0, 2 ) === "##" || escapeCharacters.indexOf( message[ 0 ] ) !== -1 )
                return false;

            /* If we're not encoding all messages or we don't have a password, strip off the magic string. */
            if ( ignore_trigger === false &&
                ( !_configFile.channels[ channel_id ] ||
                    !_configFile.channels[ channel_id ].primaryKey ||
                    !_discordCrypt._getAutoEncrypt() )
            ) {
                /* Try splitting via the defined split-arg. */
                message = message.split( '|' );

                /* Check if the message actually has the split arg. */
                if ( message.length <= 0 )
                    return false;

                /* Check if it has the trigger. */
                if ( message[ message.length - 1 ] !== _configFile.encodeMessageTrigger )
                    return false;

                /* Use the first part of the message. */
                cleaned = message[ 0 ];
            }
            /* Make sure we have a valid password. */
            else {
                /* Use the whole message. */
                cleaned = message;
            }

            /* Check if we actually have a message ... */
            if ( cleaned.length === 0 )
                return false;

            /* Get the passwords. */
            let primary_key = Buffer.from(
                _configFile.channels[ id ] && _configFile.channels[ id ].primaryKey ?
                    _configFile.channels[ id ].primaryKey :
                    _configFile.defaultPassword
            );
            let secondary_key = Buffer.from(
                _configFile.channels[ id ] && _configFile.channels[ id ].secondaryKey ?
                    _configFile.channels[ id ].secondaryKey :
                    _configFile.defaultPassword
            );

            /* If the message length is less than the threshold, we can send it without splitting. */
            if ( ( cleaned.length + 16 ) < MAX_ENCODED_DATA ) {
                /* Encrypt the message. */
                let msg = _discordCrypt.__symmetricEncrypt(
                    cleaned,
                    primary_key,
                    secondary_key,
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    true
                );

                /* Append the header to the message normally. */
                msg = ENCODED_MESSAGE_HEADER + _discordCrypt.__metaDataEncode
                (
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
                ) + msg;

                /* Return the message and any user text. */
                return [ {
                    message: `\`${msg}\``
                } ];
            }

            /* Determine how many packets we need to split this into. */
            let packets = _discordCrypt.__splitStringChunks( cleaned, MAX_ENCODED_DATA ), result = [];
            for ( let i = 0; i < packets.length; i++ ) {
                /* Encrypt the message. */
                let msg = _discordCrypt.__symmetricEncrypt(
                    packets[ i ],
                    primary_key,
                    secondary_key,
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    true
                );

                /* Append the header to the message normally. */
                msg = ENCODED_MESSAGE_HEADER + _discordCrypt.__metaDataEncode
                (
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
                ) + msg;

                /* Add to the result. */
                result.push( {
                    message: `\`${msg}\``
                } );
            }
            return result;
        }

        /**
         * @private
         * @desc Sends an encrypted message to the current channel.
         * @param {string} message The unencrypted message to send.
         * @param {boolean} [force_send] Whether to ignore checking for the encryption trigger and always encrypt.
         * @param {int} [channel_id] If specified, sends the message to this channel instead of the current channel.
         * @returns {boolean} Returns false if the message failed to be parsed correctly and 0 on success.
         */
        static _sendEncryptedMessage( message, force_send = false, channel_id = undefined ) {
            /* Attempt to encrypt the message. */
            let packets = _discordCrypt._tryEncryptMessage(
                message,
                force_send,
                channel_id || _discordCrypt._getChannelId()
            );

            /* Check if an error occurred. */
            if( typeof packets !== 'object' )
                return false;

            /* Dispatch all messages. */
            for ( let i = 0; i < packets.length; i++ ) {
                /* Send the message. */
                _discordCrypt._dispatchMessage( packets[ i ].message, channel_id );
            }
            /* Save the configuration file and store the new message(s). */
            _discordCrypt._saveConfig();

            return true;
        }

        /**
         * @private
         * @desc Block all forms of tracking.
         */
        static _blockTracking() {
            /**
             * @protected
             * @desc Patches a specific prototype with the new function.
             * @param {Array<string>|string} name The name or names of prototypes to search for.
             *      The first name will be patched if this is an array.
             * @param {function} fn The function to override the call with.
             * @param scanner
             */
            const patchPrototype = ( name, fn, scanner ) => {
                try {
                    let obj = scanner( Array.isArray( name ) ? name : [ name ] );

                    if( Array.isArray( name ) )
                        obj.prototype[ name[ 0 ] ] = fn;
                    else
                        obj.prototype[ name ] = fn;

                    _Object._freeze( obj.prototype );
                }
                catch( e ) {
                    _discordCrypt.log(
                        `Failed to hook method: ${Array.isArray( name ) ? name[ 0 ] : name}\n${e}`,
                        'warn'
                    );
                }
            };
            /**
             * @protected
             * @desc Patches a specific property with the new function.
             * @param {Array<string>|string} name The name or names of properties to search for.
             *      The first name will be patched if this is an array.
             * @param {function} fn The function to override the call with.
             * @param scanner
             */
            const patchProperty = ( name, fn, scanner ) => {
                try {
                    let obj = scanner( Array.isArray( name ) ? name : [ name ] );

                    if( Array.isArray( name ) )
                        obj[ name[ 0 ] ] = fn;
                    else
                        obj[ name ] = fn;

                    _Object._freeze( obj );
                }
                catch( e ) {
                    _discordCrypt.log(
                        `Failed to hook method: ${Array.isArray( name ) ? name[ 0 ] : name}\n${e}`,
                        'warn'
                    );
                }
            };

            /* Retrieve the scanner. */
            let searcher = _discordCrypt._getWebpackModuleSearcher();

            /**
             * @desc Patches a prototype to replace it then seals the object.
             * @param {string} name The name of the prototype to patch.
             * @param {string} message The message to log when the patched method is called.
             */
            const blockPrototype = ( name, message ) => {
                /* Remove quality reports. */
                patchPrototype(
                    name,
                    () => _discordCrypt.log( message, 'info' ),
                    searcher.findByUniquePrototypes
                );
            };

            /**
             * @desc Patches a property to replace it then seals the object.
             * @param {string} name The name of the property to patch.
             * @param {string} message The message to log when the patched method is called.
             * @param {function} fn The optional function to replace with.
             */
            const blockProperty = ( name, message, fn ) => {
                /* Remove quality reports. */
                patchProperty(
                    name,
                    fn ? fn : () => _discordCrypt.log( message, 'info' ),
                    searcher.findByUniqueProperties
                );
            };

            /* Remove quality reports. */
            blockPrototype( '_sendQualityReports', 'Blocked a voice quality report.' );

            /* Remove Raven/Sentry tracking. */
            blockPrototype( '_sendProcessedPayload', 'Blocked a Sentry tracking report.' );

            /* Remove various metadata tracking. */
            blockPrototype( 'trackWithMetadata', 'Blocked metadata tracking.' );
            blockPrototype( 'trackWithGroupMetadata', 'Blocked metadata tracking.' );
            blockPrototype( 'trackWithOverlayMetadata', 'Blocked metadata tracking.' );

            /* Block retrieval of analytics token. */
            blockProperty( 'getAnalyticsToken', '', () => {
                _discordCrypt.log( 'Blocked retrieval of analytics token.', 'info' );
                return '';
            } );

            /* Block sending of BrainTree's analytics. */
            blockProperty( 'sendEvent', '', () => {
                _discordCrypt.log( 'Blocked BrainTree from sending analytics.', 'info' );
                return '';
            } );

            /* Block reporting of suspicious code. */
            blockProperty( 'hasSuspiciousCode', 'Disabling suspicious code reporting', () => false );
        }

        /* ========================================================= */

        /* ================== UI HANDLE CALLBACKS ================== */

        /**
         * @private
         * @desc Attempts to unlock the database upon startup.
         * @param {Object} unlock_btn
         * @param {boolean} cfg_exists
         * @param {Object} pwd_field
         * @param {string} action_msg
         * @return {Function}
         */
        static _onMasterUnlockButtonClicked( unlock_btn, cfg_exists, pwd_field, action_msg ) {
            return () => {
                /* Disable the button before clicking. */
                unlock_btn.attr( 'disabled', true );

                /* Update the text. */
                if ( cfg_exists )
                    unlock_btn.text( 'Unlocking Database ...' );
                else
                    unlock_btn.text( 'Creating Database ...' );

                /* Get the password entered. */
                let password = pwd_field.val();

                /* Validate the field entered contains some value and meets the requirements. */
                if ( password && !_discordCrypt.__validatePasswordRequisites( password ) ) {
                    unlock_btn.text( action_msg );
                    unlock_btn.attr( 'disabled', false );
                    return;
                }

                /* Hash the password. */
                // noinspection JSUnresolvedFunction
                let pwd = global.scrypt.crypto_scrypt
                (
                    Buffer.from( password ),
                    Buffer.from( global.sha3.sha3_256( password ), 'hex' ),
                    16384,
                    16,
                    1,
                    32
                );

                if ( pwd ) {
                    /* To test whether this is the correct password or not, we have to attempt to use it. */
                    _masterPassword = Buffer.from( pwd );

                    /* Attempt to load the database with this password. */
                    if ( !_discordCrypt._loadConfig() ) {
                        _configFile = null;

                        /* Update the button's text. */
                        if ( cfg_exists )
                            unlock_btn.text( 'Invalid Password!' );
                        else
                            unlock_btn.text( 'Failed to create the database!' );

                        /* Clear the text field. */
                        pwd_field.val( '' );

                        /* Reset the text of the button after 1 second. */
                        setTimeout( ( function () {
                            unlock_btn.text( action_msg );
                        } ), 1000 );

                        /* Proceed no further. */
                        unlock_btn.attr( 'disabled', false );
                    }

                    /* We may now call the start() function. */
                    _self.start();

                    /* And update the button text. */
                    if ( cfg_exists )
                        unlock_btn.text( 'Unlocked Successfully!' );
                    else
                        unlock_btn.text( 'Created Successfully!' );

                    /* Close the overlay after 1 second. */
                    setTimeout( ( function () {
                        $( '#dc-master-overlay' ).remove();
                    } ), 1000 );
                }
                else {

                    /* Update the button's text. */
                    if ( cfg_exists )
                        unlock_btn.text( 'Invalid Password!' );
                    else
                        unlock_btn.text( `Error: Scrypt Failed!}` );

                    /* Clear the text field. */
                    pwd_field.val( '' );

                    /* Reset the text of the button after 1 second. */
                    setTimeout( ( function () {
                        unlock_btn.text( action_msg );
                    } ), 1000 );

                    _discordCrypt.log( error.toString(), 'error' );
                }
            }
        }

        /**
         * @private
         * @desc Opens the file uploading menu.
         */
        static _onFileMenuButtonClicked() {
            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'block' );

            /* Show the upload overlay. */
            $( '#dc-overlay-upload' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Opens the file menu selection.
         */
        static _onChangeFileButtonClicked() {
            /* Create an input element. */
            let file = require( 'electron' ).remote.dialog.showOpenDialog( {
                title: 'Select a file to encrypt and upload',
                buttonLabel: 'Select',
                message: 'Maximum file size is 50 MB',
                properties: [ 'openFile', 'showHiddenFiles', 'treatPackageAsDirectory' ]
            } );

            /* Ignore if no file was selected. */
            if ( !file.length || !file[ 0 ].length )
                return;

            /* Set the file path to the selected path. */
            $( '#dc-file-path' ).val( file[ 0 ] );
        }

        /**
         * @private
         * @desc Uploads the clipboard's current contents and sends the encrypted link.
         */
        static _onUploadEncryptedClipboardButtonClicked() {
            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = _discordCrypt._getChannelId();

            /* Upload the clipboard. */
            _discordCrypt.__up1UploadClipboard(
                _configFile.up1Host,
                _configFile.up1ApiKey,
                global.sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if (
                        error_string !== null ||
                        typeof file_url !== 'string' ||
                        typeof deletion_link !== 'string'
                    ) {
                        global.smalltalk.alert( 'Failed to upload the clipboard!', error_string );
                        return;
                    }

                    /* Format and send the message. */
                    _discordCrypt._sendEncryptedMessage( `${file_url}`, true, channel_id );

                    /* Copy the deletion link to the clipboard. */
                    // noinspection JSUnresolvedFunction
                    require( 'electron' ).clipboard.writeText( `Delete URL: ${deletion_link}` );
                }
            );
        }

        /**
         * @private
         * @desc  Uploads the selected file and sends the encrypted link.
         */
        static _onUploadFileButtonClicked() {
            const fs = require( 'original-fs' );

            let file_path_field = $( '#dc-file-path' );
            let file_upload_btn = $( '#dc-file-upload-btn' );
            let message_textarea = $( '#dc-file-message-textarea' );
            let send_deletion_link = $( '#dc-file-deletion-checkbox' ).is( ':checked' );
            let randomize_file_name = $( '#dc-file-name-random-checkbox' ).is( ':checked' );

            /* Send the additional text first if it's valid. */
            if ( message_textarea.val().length > 0 )
                _discordCrypt._sendEncryptedMessage( message_textarea.val(), true );

            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = _discordCrypt._getChannelId();

            /* Clear the message field. */
            message_textarea.val( '' );

            /* Sanity check the file. */
            if ( !fs.existsSync( file_path_field.val() ) ) {
                file_path_field.val( '' );
                return;
            }

            /* Set the status text. */
            file_upload_btn.text( 'Uploading ...' );
            file_upload_btn.addClass( 'dc-button-inverse' );

            /* Upload the file. */
            _discordCrypt.__up1UploadFile(
                file_path_field.val(),
                _configFile.up1Host,
                _configFile.up1ApiKey,
                global.sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if (
                        error_string !== null ||
                        typeof file_url !== 'string' ||
                        typeof deletion_link !== 'string'
                    ) {
                        /* Set the status text. */
                        file_upload_btn.text( 'Failed to upload the file!' );
                        _discordCrypt.log( error_string, 'error' );

                        /* Clear the file path. */
                        file_path_field.val( '' );

                        /* Reset the status text after 1 second. */
                        setTimeout( () => {
                            file_upload_btn.text( 'Upload' );
                            file_upload_btn.removeClass( 'dc-button-inverse' );
                        }, 1000 );

                        return;
                    }

                    /* Format and send the message. */
                    _discordCrypt._sendEncryptedMessage(
                        `${file_url}${
                            send_deletion_link ?
                                '\n\nDelete URL: ' + deletion_link :
                                ''
                        }`,
                        true,
                        channel_id
                    );

                    /* Clear the file path. */
                    file_path_field.val( '' );

                    /* Indicate success. */
                    file_upload_btn.text( 'Upload Successful!' );

                    /* Reset the status text after 1 second and close the dialog. */
                    setTimeout( () => {
                        file_upload_btn.text( 'Upload' );
                        file_upload_btn.removeClass( 'dc-button-inverse' );

                        /* Close. */
                        $( '#dc-file-cancel-btn' ).click();
                    }, 1000 );
                },
                randomize_file_name
            );
        }

        /**
         * @private
         * @desc Closes the file upload dialog.
         */
        static _onCloseFileMenuButtonClicked() {
            /* Clear old file name. */
            $( '#dc-file-path' ).val( '' );

            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'none' );

            /* Show the upload overlay. */
            $( '#dc-overlay-upload' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Opens the settings menu.
         */
        static _onSettingsButtonClicked() {
            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'block' );

            /* Show the main settings menu. */
            $( '#dc-overlay-settings' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Selects the Plugin Settings tab.
         */
        static _onSettingsTabButtonClicked() {
            /* Select the plugin settings. */
            _discordCrypt._setActiveSettingsTab( 0 );
        }

        /**
         * @private
         * @desc Selects the Database Settings tab and loads key info.
         */
        static _onDatabaseTabButtonClicked() {
            /* Cache the table. */
            let table = $( '#dc-database-entries' );

            /* Clear all entries. */
            table.html( '' );

            /* Resolve all users, guilds and channels the current user is a part of. */
            // noinspection JSUnresolvedFunction
            let users = _cachedModules.UserStore.getUsers(),
                guilds = _cachedModules.GuildStore.getGuilds(),
                channels = _cachedModules.ChannelStore.getChannels();

            /* Iterate over each password in the configuration. */
            for ( let prop in _configFile.channels ) {
                let name = '', icon, id = prop;

                /* Skip channels that don't have an ID. */
                if ( !channels[ id ] )
                    continue;

                /* Skip channels that don't have a custom password. */
                if(  !_configFile.channels[ id ].primaryKey || !_configFile.channels[ id ].secondaryKey )
                    continue;

                /* Choose a default icon. */
                icon = 'https://cdn.discordapp.com/icons/444361997811974144/74cb26731242af7fdd60a62c29dc7560.png';

                /* Check for the correct channel type. */
                if ( channels[ id ].type === 0 ) {
                    /* GUILD_TEXT */
                    let guild = guilds[ channels[ id ].guild_id ];

                    /* Resolve the name as a "Guild ( #Channel )" format. */
                    name = `${guild.name} ( #${channels[ id ].name} )`;

                    /* Update the icon. */
                    if( guild.icon )
                        icon = `https://cdn.discordapp.com/icons/${channels[ id ].guild_id}/${guild.icon}.png`;
                }
                else if ( channels[ id ].type === 1 ) {
                    /* DM */
                    // noinspection JSUnresolvedVariable
                    let user = users[ channels[ id ].recipients[ 0 ] ];

                    /* Indicate this is a DM and give the full user name. */
                    name = `@${user.username}`;

                    /* Update the icon. */
                    if( user.id && user.avatar )
                        icon = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
                }
                else if ( channels[ id ].type === 3 ) {
                    /* GROUP_DM */

                    /* Try getting the channel name first. */
                    if( channels[ id ].name )
                        name = channels[ id ].name;
                    else {
                        // noinspection JSUnresolvedVariable
                        let max = channels[ id ].recipients.length > 3 ? 3 : channels[ id ].recipients.length,
                            participants = '';

                        /* Iterate the maximum number of users we can display. */
                        for( let i = 0; i < max; i++ ) {
                            // noinspection JSUnresolvedVariable
                            let user = users[ channels[ id ].recipients[ i ] ];
                            participants += `@${user.username}#${user.discriminator} `;
                        }

                        /* List a maximum of three members. */
                        name = `${participants}`;
                    }

                    /* Update the icon. */
                    if( channels[ id ].icon )
                        icon = `https://cdn.discordapp.com/channel-icons/${id}/${channels[ id ].icon}.png`;
                }
                else
                    continue;

                /* Create the elements needed for building the row. */
                let element =
                        $( `<tr>
                                <td class="dc-ruler-align">
                                    <div class="dc-icon" style="background-image:url(${icon});"></div>
                                    <p>${name}</p>
                                </td>
                                <td>
                                    <div style="display:flex;"></div>
                                </td>
                            </tr>` ),
                    delete_btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'Delete Keys' ),
                    copy_btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'Copy Keys' ),
                    encrypt_icon = $( '<div>' )
                        .addClass( 'dc-tooltip' )
                        .css( 'background-color', 'transparent' )
                        .html(
                            Buffer.from(
                                _configFile.channels[ id ].autoEncrypt ? LOCK_ICON : UNLOCK_ICON,
                                'base64'
                            )
                                .toString( 'utf8' )
                        );

                /* Handle deletion clicks. */
                delete_btn.click( function () {
                    /* Delete the entry. */
                    _configFile.channels[ id ].primaryKey = _configFile.channels[ id ].secondaryKey = null;

                    /* Disable auto-encryption for the channel */
                    _configFile.channels[ id ].autoEncrypt = false;

                    /* Save the configuration. */
                    _discordCrypt._saveConfig();

                    /* Remove the entire row. */
                    delete_btn.parent().parent().remove();
                } );

                /* Handle copy clicks. */
                copy_btn.click( function() {
                    /* Resolve the entry. */
                    let current_keys = _configFile.channels[ id ];
                    let primary = current_keys.primaryKey || _configFile.defaultPassword;
                    let secondary = current_keys.secondaryKey || _configFile.defaultPassword;

                    /* Write to the clipboard. */
                    // noinspection JSUnresolvedFunction
                    require( 'electron' ).clipboard.writeText(
                        `Primary Key: ${primary}\n\nSecondary Key: ${secondary}`
                    );

                    copy_btn.text( 'Copied' );

                    setTimeout( () => {
                        copy_btn.text( 'Copy Keys' );
                    }, 1000 );
                } );

                /* Handle toggling states. */
                encrypt_icon.click( function() {
                    /* Toggle the encryption state for the channel */
                    _configFile.channels[ id ].autoEncrypt = !_configFile.channels[ id ].autoEncrypt;

                    /* Save the configuration. */
                    _discordCrypt._saveConfig();

                    /* Update the icon. */
                    encrypt_icon.html(
                        Buffer.from(
                            _configFile.channels[ id ].autoEncrypt ? LOCK_ICON : UNLOCK_ICON,
                            'base64'
                        )
                            .toString( 'utf8' ) );
                } );

                /* Append the buttons to the Options column. */
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( encrypt_icon );
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( copy_btn );
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( delete_btn );

                /* Append the entire entry to the table. */
                table.append( element );
            }

            /* Select the database settings. */
            _discordCrypt._setActiveSettingsTab( 1 );
        }

        /**
         * @private
         * @desc Selects the Security Settings tab and loads all blacklisted updates.
         */
        static _onSecurityTabButtonClicked() {
            /* Get the table to show blacklisted updates. */
            let table = $( '#dc-update-blacklist-entries' );

            /* Clear all entries. */
            table.html( '' );

            /* Iterate over all entries. */
            for ( let i = 0; i < _configFile.blacklistedUpdates.length; i++ ) {
                /* Get the update info. */
                let updateInfo = _configFile.blacklistedUpdates[ i ];

                /* Skip empty values.*/
                if( !updateInfo )
                    continue;

                /* Create the elements needed for building the row. */
                let element =
                        $( `<tr><td>${updateInfo.version}</td><td><div style="display:flex;"></div></td></tr>` ),
                    remove_btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'Remove' ),
                    changelog_btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'View Changelog' ),
                    info_btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'Info' );

                /* Handle the remove entry button clicked. */
                remove_btn.click( function () {
                    /* Delete the entry. */
                    delete _configFile.blacklistedUpdates[ i ];
                    _configFile.blacklistedUpdates = _configFile.blacklistedUpdates.filter( e => e );

                    /* Save the configuration. */
                    _discordCrypt._saveConfig();
                    /* Remove the entire row. */
                    remove_btn.parent().parent().parent().remove();
                } );

                /* Handle the changelog button clicked. */
                changelog_btn.click( function() {
                    global.smalltalk.alert(
                        `Changes`,
                        _discordCrypt.__tryParseChangelog( updateInfo.changelog, _self.getVersion() )
                    );
                } );

                /* Handle the signatures button clicked. */
                info_btn.click( function() {
                    global.openpgp.key.readArmored( _discordCrypt.__zlibDecompress( PGP_SIGNING_KEY ) ).then(
                        r => {
                            let key_id = Buffer.from( r.keys[ 0 ].primaryKey.fingerprint )
                                .toString( 'hex' )
                                .toUpperCase();

                            global.smalltalk.alert(
                                'Update Info',
                                `<strong>Version</strong>: ${updateInfo.version}\n\n` +
                                `<strong>Verified</strong>: ${updateInfo.valid ? 'Yes' : 'No'}\n\n` +
                                `<strong>Key ID</strong>: ${key_id}\n\n` +
                                `<strong>Hash</strong>: ${updateInfo.hash}\n\n` +
                                '<code class="hljs dc-code-block" style="background: none !important;">' +
                                `${updateInfo.signature}</code>`
                            );
                        }
                    );
                } );

                /* Add all option buttons to the Options column. */
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( changelog_btn );
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( info_btn );
                $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( remove_btn );

                /* Add the row to the table. */
                table.append( element );
            }

            /* Set the current state of automatic updates. */
            $( '#dc-automatic-updates-enabled' ).prop( 'checked', _configFile.automaticUpdates );

            /* Select the security settings. */
            _discordCrypt._setActiveSettingsTab( 2 );
        }

        /**
         * @private
         * @desc Selects the About tab.
         */
        static _onAboutTabButtonClicked() {
            /* Select the about tab. */
            _discordCrypt._setActiveSettingsTab( 3 );
        }

        /**
         * @private
         * @desc Toggles the automatic update checking function.
         */
        static _onAutomaticUpdateCheckboxChanged() {
            /* Set the state. */
            _configFile.automaticUpdates = $( '#dc-automatic-updates-enabled' )
                .is( ':checked' );

            /* Save the configuration. */
            _discordCrypt._saveConfig();

            /* Log. */
            _discordCrypt.log( `${_configFile.automaticUpdates ? 'En' : 'Dis'}abled automatic updates.`, 'debug' );

            /* Skip if we don't need to update. */
            if( !_discordCrypt._shouldIgnoreUpdates( _self.getVersion() ) ) {
                /* If we're doing automatic updates, make sure an interval is set. */
                if( _configFile.automaticUpdates ) {
                    /* Only do this if none is defined. */
                    if( !_updateHandlerInterval ) {
                        /* Add an update handler to check for updates every 60 minutes. */
                        _updateHandlerInterval = setInterval( () => {
                            _discordCrypt._checkForUpdates();
                        }, 3600000 );
                    }
                }
                /* Make sure no interval is defined. */
                else if( _updateHandlerInterval ) {
                    /* Make sure to clear all intervals. */
                    clearInterval( _updateHandlerInterval );
                    _updateHandlerInterval = null;
                }
            }
        }

        /**
         * @private
         * @desc Checks for updates immediately.
         */
        static _onCheckForUpdatesButtonClicked() {
            /* Simply call the wrapper, everything else will be handled by this. */
            _discordCrypt._checkForUpdates();
        }

        /**
         * @private
         * @desc Opens a file dialog to import a JSON encoded entries file.
         */
        static _onImportDatabaseButtonClicked() {
            /* Get the FS module. */
            const fs = require( 'fs' );

            /* Create an input element. */
            // noinspection JSUnresolvedFunction
            let files = require( 'electron' ).remote.dialog.showOpenDialog( {
                title: 'Import Database',
                message: 'Select the configuration file(s) to import',
                buttonLabel: 'Import',
                filters: [ {
                    name: 'Database Entries ( *.json )',
                    extensions: [ 'json' ]
                } ],
                properties: [ 'openFile', 'multiSelections', 'showHiddenFiles', 'treatPackageAsDirectory' ]
            } );

            /* Ignore if no files was selected. */
            if ( !files.length )
                return;

            /* Cache the button. */
            let import_btn = $( '#dc-import-database-btn' );

            /* For reference. */
            let imported = 0;

            /* Update the status. */
            import_btn.text( `Importing ( ${files.length} ) File(s)` );

            /* Loop over every file.  */
            for ( let i = 0; i < files.length; i++ ) {
                let file = files[ i ],
                    data;

                /* Sanity check. */
                if ( !fs.statSync( file ).isFile() )
                    continue;

                /* Read the file. */
                try {
                    data = JSON.parse( fs.readFileSync( file ).toString() );
                }
                catch ( e ) {
                    _discordCrypt.log( `Error reading JSON file '${file} ...`, 'warn' );
                    continue;
                }

                /* Make sure the root element of entries exists. */
                if ( !data._discordCrypt_entries || !data._discordCrypt_entries.length )
                    continue;

                /* Iterate all entries. */
                for ( let j = 0; j < data._discordCrypt_entries.length; j++ ) {
                    let e = data._discordCrypt_entries[ j ];

                    /* Skip invalid entries. */
                    if ( !e.id || !e.primary || !e.secondary )
                        continue;

                    /* Determine if to count this as an import or an update which aren't counted. */
                    if ( !_configFile.channels.hasOwnProperty( e.id ) ) {
                        /* Update the number imported. */
                        imported++;
                    }

                    /* Make sure the entry exists. */
                    if( !_configFile.channels[ e.id ] ) {
                        /* Add it to the configuration file. */
                        _configFile.channels[ e.id ] = {
                            primaryKey: e.primary,
                            secondaryKey: e.secondary,
                            encodeAll: true,
                            ignoreIds: []
                        };
                    }
                    else {
                        /* Update. */
                        _configFile.channels[ e.id ].primaryKey = e.primary;
                        _configFile.channels[ e.id ].secondaryKey = e.secondary;
                    }
                }
            }

            /* Update the button's text. */
            setTimeout( () => {
                import_btn.text( `Imported (${imported}) ${imported === 1 ? 'Entry' : 'Entries'}` );

                /* Reset the button's text. */
                setTimeout( () => {
                    import_btn.text( 'Import Database(s)' );
                }, 1000 );

            }, 500 );

            /* Determine if to save the database. */
            if ( imported !== 0 ) {
                /* Trigger updating the database entries field. */
                _discordCrypt._onDatabaseTabButtonClicked();

                /* Save the configuration. */
                _discordCrypt._saveConfig();
            }
        }

        /**
         * @private
         * @desc Opens a file dialog to export a JSON encoded entries file.
         */
        static _onExportDatabaseButtonClicked() {
            /* Generate a random captcha to verify the user wants to do this.*/
            let captcha = _discordCrypt.__generateWordCaptcha();

            /* Alert the user before they do this. */
            global.smalltalk.prompt(
                'EXPORT WARNING',
                'Exporting your database is <b>DANGEROUS</b>.\n\n' +
                'You should only do this when <u>explicitly</u> directed by the plugin\'s developers.\n\n\n' +
                '<b>N.B. Exports will NOT be encrypted. Be responsible.</b>\n\n' +
                'Enter the following and click "OK" to export the database:\n\n\n' +
                `<p style="text-indent: 20px"><b>${captcha.captcha}</b></p>\n\n`,
                ''
            )
                .then(
                    ( value ) => {
                        /* Make sure the user entered the correct passphrase before continuing. */
                        if( value.toLowerCase().trim() !== captcha.passphrase ) {
                            setImmediate( _discordCrypt._onExportDatabaseButtonClicked );
                            return;
                        }

                        /* Create an input element. */
                        // noinspection JSUnresolvedFunction
                        let file = require( 'electron' ).remote.dialog.showSaveDialog( {
                            title: 'Export Database',
                            message: 'Select the destination file',
                            buttonLabel: 'Export',
                            filters: [ {
                                name: 'Database Entries ( *.json )',
                                extensions: [ 'json' ]
                            } ]
                        } );

                        /* Ignore if no files was selected. */
                        if ( !file.length )
                            return;

                        /* Get the FS module. */
                        const fs = require( 'fs' );

                        /* Cache the button. */
                        let export_btn = $( '#dc-export-database-btn' );

                        /* Create the main object for exporting. */
                        let data = { _discordCrypt_entries: [] },
                            entries;

                        /* Iterate each entry in the configuration file. */
                        for ( let prop in _configFile.channels ) {
                            let e = _configFile.channels[ prop ];

                            /* Skip entries without a primary and secondary key. */
                            if( !e || !e.primaryKey || !e.secondaryKey )
                                continue;

                            /* Insert the entry to the list. */
                            data._discordCrypt_entries.push( {
                                id: prop,
                                primary: e.primaryKey,
                                secondary: e.secondaryKey
                            } );
                        }

                        /* Update the entry count. */
                        entries = data._discordCrypt_entries.length;

                        try {
                            /* Try writing the file. */
                            fs.writeFileSync( file, JSON.stringify( data, null, '    ' ) );

                            /* Update the button's text. */
                            export_btn.text( `Exported (${entries}) ${entries === 1 ? 'Entry' : 'Entries'}` );
                        }
                        catch ( e ) {
                            /* Log an error. */
                            _discordCrypt.log( `Error exporting entries: ${e.toString()}`, 'error' );

                            /* Update the button's text. */
                            export_btn.text( 'Error: See Console' );
                        }

                        /* Reset the button's text. */
                        setTimeout( () => {
                            export_btn.text( 'Export Database' );
                        }, 1000 );
                    },
                    () => {
                        /* Ignored. */
                    }
                );
        }

        /**
         * @private
         * @desc Clears all entries in the database.
         */
        static _onClearDatabaseEntriesButtonClicked() {
            /* Cache the button. */
            let erase_entries_btn = $( '#dc-erase-entries-btn' );

            /* Remove all entries. */
            for( let id in _configFile.channels )
                _configFile.channels[ id ].primaryKey = _configFile.channels[ id ].secondaryKey = null;

            /* Clear the table. */
            $( '#dc-database-entries' ).html( '' );

            /* Save the database. */
            _discordCrypt._saveConfig();

            /* Update the button's text. */
            erase_entries_btn.text( 'Cleared Entries' );

            /* Reset the button's text. */
            setTimeout( () => {
                erase_entries_btn.text( 'Erase Entries' );
            }, 1000 );
        }

        /**
         * @private
         * @desc Closes the settings menu.
         */
        static _onSettingsCloseButtonClicked() {
            /* Select the plugin settings. */
            _discordCrypt._setActiveSettingsTab( 0 );

            /* Hide main background. */
            $( '#dc-overlay' ).css( 'display', 'none' );

            /* Hide the main settings menu. */
            $( '#dc-overlay-settings' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Saves all settings.
         */
        static _onSaveSettingsButtonClicked() {
            /* Cache jQuery results. */
            let dc_primary_cipher = $( '#dc-primary-cipher' ),
                dc_secondary_cipher = $( '#dc-secondary-cipher' ),
                dc_master_password = $( '#dc-master-password' ),
                dc_save_settings_btn = $( '#dc-settings-save-btn' );

            /* Update all settings from the settings panel. */
            _configFile.timedMessageExpires = parseInt( $( '#dc-settings-timed-expire' ).val() );
            _configFile.autoAcceptKeyExchanges = $( '#dc-auto-accept-keys' ).is( ':checked' );
            _configFile.exchangeBitSize = parseInt( $( '#dc-settings-exchange-mode' ).val() );
            _configFile.encodeMessageTrigger = $( '#dc-settings-encrypt-trigger' ).val();
            _configFile.decryptedPrefix = $( '#dc-settings-decrypted-prefix' ).val();
            _configFile.encryptBlockMode = $( '#dc-settings-cipher-mode' ).val();
            _configFile.defaultPassword = $( '#dc-settings-default-pwd' ).val();
            _configFile.paddingMode = $( '#dc-settings-padding-mode' ).val();
            _configFile.encryptMode = _discordCrypt
                .__cipherStringToIndex( dc_primary_cipher.val(), dc_secondary_cipher.val() );

            dc_primary_cipher.val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
            dc_secondary_cipher.val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );

            /* Update icon */
            _discordCrypt._updateLockIcon();

            /* Handle master password updates if necessary. */
            if ( dc_master_password.val() !== '' ) {
                let password = dc_master_password.val();

                /* Ensure the password meets the requirements. */
                if( !_discordCrypt.__validatePasswordRequisites( password ) )
                    return;

                /* Reset the password field. */
                dc_master_password.val( '' );

                /* Disable the button since this takes a while. */
                dc_save_settings_btn.attr( 'disabled', true );

                /* Hash the password. */
                // noinspection JSUnresolvedFunction
                let pwd = global.scrypt.crypto_scrypt
                (
                    Buffer.from( password ),
                    Buffer.from( global.sha3.sha3_256( password ), 'hex' ),
                    16384,
                    16,
                    1,
                    32
                );

                /* Enable the button. */
                dc_save_settings_btn.attr( 'disabled', false );

                if ( !pwd || typeof pwd !== 'string' || !pwd.length ) {
                    /* Alert the user. */
                    global.smalltalk.alert(
                        'DiscordCrypt Error',
                        'Error setting the new database password. Check the console for more info.'
                    );

                    _discordCrypt.log( error.toString(), 'error' );
                    return;
                }

                /* Now update the password. */
                _masterPassword = Buffer.from( pwd );

                /* Save the configuration file and update the button text. */
                _discordCrypt._saveSettings( dc_save_settings_btn );
            }
            else {
                /* Save the configuration file and update the button text. */
                _discordCrypt._saveSettings( dc_save_settings_btn );
            }
        }

        /**
         * @private
         * @desc Resets the user settings to their default values.
         */
        static _onResetSettingsButtonClicked() {
            /* Resets the configuration file and update the button text. */
            _discordCrypt._resetSettings( $( '#dc-settings-reset-btn' ) );

            /* Update all settings from the settings panel. */
            $( '#dc-secondary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );
            $( '#dc-primary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
            $( '#dc-auto-accept-keys' ).prop( 'checked', _configFile.autoAcceptKeyExchanges );
            $( '#dc-settings-cipher-mode' ).val( _configFile.encryptBlockMode.toLowerCase() );
            $( '#dc-settings-padding-mode' ).val( _configFile.paddingMode.toLowerCase() );
            $( '#dc-settings-encrypt-trigger' ).val( _configFile.encodeMessageTrigger );
            $( '#dc-settings-timed-expire' ).val( _configFile.timedMessageExpires );
            $( '#dc-settings-decrypted-prefix' ).val( _configFile.decryptedPrefix );
            $( '#dc-settings-exchange-mode' ).val( _configFile.exchangeBitSize );
            $( '#dc-settings-default-pwd' ).val( _configFile.defaultPassword );
            $( '#dc-master-password' ).val( '' );
        }

        /**
         * @private
         * @desc Applies the update & restarts the app by performing changing URLs to /channels/@me.
         */
        static _onUpdateRestartNowButtonClicked() {
            const replacePath = require( 'path' )
                .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );
            const fs = require( 'fs' );

            /* Replace the file. */
            fs.writeFile( replacePath, _updateData.payload, ( err ) => {
                if ( err ) {
                    _discordCrypt.log(
                        "Unable to replace the target plugin. " +
                        `( ${err} )\nDestination: ${replacePath}`,
                        'error'
                    );
                    global.smalltalk.alert( 'Error During Update', 'Failed to apply the update!' );
                }
            } );

            /* Reload the main URI. */
            window.location.pathname = '/channels/@me';
        }

        /**
         * @private
         * @desc Applies the update & closes the upload available panel.
         */
        static _onUpdateRestartLaterButtonClicked() {
            const replacePath = require( 'path' )
                .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );
            const fs = require( 'fs' );

            /* Replace the file. */
            fs.writeFile( replacePath, _updateData.payload, ( err ) => {
                if ( err ) {
                    _discordCrypt.log(
                        "Unable to replace the target plugin. " +
                        `( ${err} )\nDestination: ${replacePath}`,
                        'error'
                    );
                    global.smalltalk.alert( 'Error During Update', 'Failed to apply the update!' );
                }
            } );

            /* Also reset any opened tabs. */
            _discordCrypt._setActiveSettingsTab( 0 );
            _discordCrypt._setActiveExchangeTab( 0 );

            /* Hide the update and changelog. */
            $( '#dc-overlay' ).css( 'display', 'none' );
            $( '#dc-overlay-update' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Adds the upper scoped update info to the blacklist, saves the configuration file and
         *      closes the update window.
         */
        static _onUpdateIgnoreButtonClicked() {
            /* Clear out the needless data which isn't actually needed to validate a blacklisted update. */
            _updateData.payload = '';

            /* Add the blacklist to the configuration file. */
            _configFile.blacklistedUpdates.push( _updateData );

            /* Save the configuration. */
            _discordCrypt._saveConfig();

            /* Also reset any opened tabs. */
            _discordCrypt._setActiveSettingsTab( 0 );
            _discordCrypt._setActiveExchangeTab( 0 );

            /* Hide the update and changelog. */
            $( '#dc-overlay' ).css( 'display', 'none' );
            $( '#dc-overlay-update' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Generates and sends a new public key.
         */
        static _onQuickHandshakeButtonClicked() {
            const DH_S = _discordCrypt.__getDHBitSizes(),
                ECDH_S = _discordCrypt.__getECDHBitSizes();

            let channelId = _discordCrypt._getChannelId();

            /* Ensure no other keys exist. */
            if( _globalSessionState.hasOwnProperty( channelId ) ) {
                global.smalltalk.alert(
                    '----- WARNING -----',
                    'Cannot start a new session while an existing handshake is pending ...'
                );
                return;
            }

            /* Create the session object. */
            _globalSessionState[ channelId ] = {};
            let isECDH = DH_S.indexOf( _configFile.exchangeBitSize ) === -1;

            /* Generate a local key pair. */
            if( !isECDH )
                _globalSessionState[ channelId ].privateKey =
                    _discordCrypt.__generateDH( _configFile.exchangeBitSize );
            else
                _globalSessionState[ channelId ].privateKey =
                    _discordCrypt.__generateECDH( _configFile.exchangeBitSize );

            /* Get the public key for this private key. */
            let encodedKey = _discordCrypt.__encodeExchangeKey(
                Buffer.from(
                    _globalSessionState[ channelId ].privateKey.getPublicKey( 'hex', isECDH ? 'compressed' : null ),
                    'hex'
                ),
                isECDH ?
                    DH_S.length + ECDH_S.indexOf( _configFile.exchangeBitSize ) :
                    DH_S.indexOf( _configFile.exchangeBitSize )
            );

            /* Dispatch the public key. */
            _discordCrypt._dispatchMessage(
                `\`${encodedKey}\``,
                channelId,
                KEY_DELETE_TIMEOUT
            );

            /* Get the local key info. */
            _globalSessionState[ channelId ].localKey = _discordCrypt.__extractExchangeKeyInfo(
                encodedKey,
                true
            );
        }

        /**
         * @private
         * @desc Opens the password editor menu.
         */
        static _onOpenPasswordMenuButtonClicked() {
            $( '#dc-overlay' ).css( 'display', 'block' );
            $( '#dc-overlay-password' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Saves the entered passwords for the current channel or DM.
         */
        static _onSavePasswordsButtonClicked() {
            let save_btn = $( '#dc-save-pwd' ),
                primary_password = $( "#dc-password-primary" ),
                secondary_password = $( "#dc-password-secondary" );

            /* Ensure both the primary and secondary password fields are specified. */
            if( !primary_password.val().length || !secondary_password.val().length ) {
                save_btn.text( 'Please Fill In Both Fields !' );

                /* Reset the button text after. */
                setTimeout( () => {
                    /* Reset text. */
                    save_btn.text( "Save Password" );
                }, 1000 );

                return;
            }

            /* Update the password and save it. */
            _discordCrypt._updatePasswords( primary_password.val(), secondary_password.val() );

            /* Update the text for the button. */
            save_btn.text( "Saved!" );

            /* Reset the text for the password button after a 1 second delay. */
            setTimeout( ( function () {
                /* Reset text. */
                save_btn.text( "Save Password" );

                /* Clear the fields. */
                primary_password.val( '' );
                secondary_password.val( '' );

                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 1000 );
        }

        /**
         * @private
         * @desc Resets passwords for the current channel or DM to their defaults.
         */
        static _onResetPasswordsButtonClicked() {
            let reset_btn = $( '#dc-reset-pwd' );

            /* Disable auto-encrypt for the channel */
            _discordCrypt._setAutoEncrypt( false );

            let id = _discordCrypt._getChannelId();

            /* Reset the configuration for this user and save the file. */
            _configFile.channels[ id ].primaryKey =
                _configFile.channels[ id ].secondaryKey = null;

            /* Save them. */
            _discordCrypt._saveConfig();

            /* Update the text for the button. */
            reset_btn.text( "Password Reset!" );

            setTimeout( ( function () {
                /* Reset text. */
                reset_btn.text( "Reset Password" );

                /* Clear the fields. */
                $( "#dc-password-primary" ).val( '' );
                $( "#dc-password-secondary" ).val( '' );

                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 1000 );
        }

        /**
         * @private
         * @desc Closes the password editor menu.
         */
        static _onClosePasswordMenuButtonClicked() {
            /* Clear the fields. */
            $( "#dc-password-primary" ).val( '' );
            $( "#dc-password-secondary" ).val( '' );

            /* Close after a .25 second delay. */
            setTimeout( ( function () {
                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 250 );
        }

        /**
         * @private
         * @desc Prompts the user on their passphrase generation options.
         */
        static _onGeneratePassphraseClicked() {
            global.smalltalk.prompt(
                'GENERATE A SECURE PASSPHRASE',
                'Please enter how many words you\'d like this passphrase to have below.\n' +
                'Be advised that a minimum word length of <b><u>20</u></b> is recommended.\n\n',
                '20'
            ).then(
                ( value ) => {
                    /* Validate the value entered. */
                    if( typeof value !== 'string' || !value.length || isNaN( value ) ) {
                        global.smalltalk.alert( 'ERROR', 'Invalid number entered' );
                        return;
                    }

                    /* Generate the word list. */
                    let { entropy, passphrase } = _discordCrypt.__generateDicewarePassphrase( parseInt( value ) );

                    /* Alert the user. */
                    global.smalltalk.prompt(
                        `GENERATED A ${parseInt( value )} WORD LONG PASSPHRASE`,
                        `This passphrase contains approximately <b>${Math.round( entropy )} bits of entropy</b>.\n\n` +
                        'Please copy your generated passphrase below:\n\n',
                        passphrase
                    ).then(
                        () => {
                            /* Copy to the clipboard then close. */
                            require( 'electron' ).clipboard.writeText( passphrase );
                        },
                        () => {
                            /* Ignored. */
                        }
                    );
                },
                () => {
                    /* Ignored. */
                }
            );
        }

        /**
         * @private
         * @desc Copies the passwords from the current channel or DM to the clipboard.
         */
        static _onCopyCurrentPasswordsButtonClicked() {
            // noinspection JSUnresolvedVariable
            let currentKeys = _configFile.channels[ _discordCrypt._getChannelId() ],
                writeText = require( 'electron' ).clipboard.writeText;

            /* If no password is currently generated, write the default key. */
            if ( !currentKeys || !currentKeys.primaryKey || !currentKeys.secondaryKey ) {
                writeText( `Default Password: ${_configFile.defaultPassword}` );
                return;
            }

            /* Write to the clipboard. */
            writeText( `Primary Key: ${currentKeys.primaryKey}\r\n\r\nSecondary Key: ${currentKeys.secondaryKey}` );

            /* Alter the button text. */
            $( '#dc-cpy-pwds-btn' ).text( 'Copied Keys To Clipboard!' );

            /* Reset the button after 1 second close the prompt. */
            setTimeout( ( function () {
                /* Reset. */
                $( '#dc-cpy-pwds-btn' ).text( 'Copy Current Passwords!' );

                /* Close. */
                $( '#dc-cancel-btn' ).click();
            } ), 1000 );
        }

        /**
         * @private
         * @desc Enables or disables automatic message encryption.
         */
        static _onForceEncryptButtonClicked() {
            /* Cache jQuery results. */
            let dc_lock_btn = $( '#dc-lock-btn' ), new_tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

            /* Update the icon and toggle. */
            if ( !_discordCrypt._getAutoEncrypt() ) {
                dc_lock_btn.html( Buffer.from( LOCK_ICON, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( new_tooltip.text( 'Disable Message Encryption' ) );
                _discordCrypt._setAutoEncrypt( true );
            }
            else {
                dc_lock_btn.html( Buffer.from( UNLOCK_ICON, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( new_tooltip.text( 'Enable Message Encryption' ) );
                _discordCrypt._setAutoEncrypt( false );
            }

            /* Save config. */
            _discordCrypt._saveConfig();
        }

        /**
         * @private
         * @desc Updates the lock icon
         */
        static _updateLockIcon() {
            /* Cache jQuery results. */
            let dc_lock_btn = $( '#dc-lock-btn' ), tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

            /* Update the icon based on the channel */
            if ( _discordCrypt._getAutoEncrypt() ) {
                dc_lock_btn.html( Buffer.from( LOCK_ICON, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( tooltip.text( 'Disable Message Encryption' ) );
            }
            else {
                dc_lock_btn.html( Buffer.from( UNLOCK_ICON, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( tooltip.text( 'Enable Message Encryption' ) );
            }

            /* Set the button class. */
            $( '.dc-svg' ).attr( 'class', 'dc-svg' );
        }

        /**
         * @private
         * @desc Sets the active tab index in the settings menu.
         * @param {int} index The index ( 0-1 ) of the page to activate.
         * @example
         * setActiveTab( 1 );
         */
        static _setActiveSettingsTab( index ) {
            let tab_names = [ 'dc-plugin-settings-tab', 'dc-database-settings-tab', 'dc-security-settings-tab' ];
            let tabs = $( '#dc-settings-tab .dc-tab-link' );

            /* Hide all tabs. */
            for ( let i = 0; i < tab_names.length; i++ )
                $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

            /* Deactivate all links. */
            tabs.removeClass( 'active' );

            switch ( index ) {
            case 0:
                $( '#dc-plugin-settings-btn' ).addClass( 'active' );
                $( '#dc-plugin-settings-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-database-settings-btn' ).addClass( 'active' );
                $( '#dc-database-settings-tab' ).css( 'display', 'block' );
                break;
            case 2:
                $( '#dc-security-settings-btn' ).addClass( 'active' );
                $( '#dc-security-settings-tab' ).css( 'display', 'block' );
                break;
            case 3:
                $( '#dc-about-settings-btn' ).addClass( 'active' );
                $( '#dc-about-settings-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
            }
        }

        /**
         * @private
         * @desc Sets the active tab index in the exchange key menu.
         * @param {int} index The index ( 0-2 ) of the page to activate.
         * @example
         * setActiveTab( 1 );
         */
        static _setActiveExchangeTab( index ) {
            let tab_names = [ 'dc-about-tab', 'dc-keygen-tab', 'dc-handshake-tab' ];
            let tabs = $( '#dc-exchange-tab .dc-tab-link' );

            /* Hide all tabs. */
            for ( let i = 0; i < tab_names.length; i++ )
                $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

            /* Deactivate all links. */
            tabs.removeClass( 'active' );

            switch ( index ) {
            case 0:
                $( '#dc-tab-info-btn' ).addClass( 'active' );
                $( '#dc-about-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-tab-keygen-btn' ).addClass( 'active' );
                $( '#dc-keygen-tab' ).css( 'display', 'block' );
                break;
            case 2:
                $( '#dc-tab-handshake-btn' ).addClass( 'active' );
                $( '#dc-handshake-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
            }
        }

        /* ========================================================= */

        /* ====================== APP UTILITIES ==================== */

        /**
         * @private
         * @desc Derives a primary and secondary key from a session state.
         * @param {string} channelId The channel that this exchange is being computed for.
         * @param {number} outputBitLength The length in bits of the output keys.
         * @return {{primaryKey: string, secondaryKey: string}|null}
         */
        static _deriveExchangeKeys( channelId, outputBitLength = 2048 ) {
            /* Defined customization parameters for the KMAC-256 derivation. */
            const primaryMAC = new Uint8Array( Buffer.from( 'discordCrypt-primary-secret' ) ),
                secondaryMAC = new Uint8Array( Buffer.from( 'discordCrypt-secondary-secret' ) );

            /* Converts a hex-encoded string to a Base64 encoded string. */
            const convert = ( k ) => Buffer.from( k, 'hex' ).toString( 'base64' );

            /* Store the state for easier manipulation. */
            let _state = _globalSessionState[ channelId ];

            /* Calculate the derived secret as a hex encoded string. */
            let derivedKey = _discordCrypt.__computeExchangeSharedSecret( _state.privateKey, _state.remoteKey.key );

            /* Make sure a key was derived. */
            if( !derivedKey )
                return null;

            /* Retrieve the primary and secondary salts. */
            let primarySalt = _discordCrypt.__binaryCompare( _state.localKey.salt, _state.remoteKey.salt ),
                secondarySalt = primarySalt.compare( _state.localKey.salt ) === 0 ?
                    _state.remoteKey.salt :
                    _state.localKey.salt;

            /* Calculate the KMACs for the primary and secondary key. */
            // noinspection JSUnresolvedFunction
            return {
                primaryKey: convert( global.sha3.kmac256( primarySalt, derivedKey, outputBitLength, primaryMAC ) ),
                secondaryKey: convert( global.sha3.kmac256( secondarySalt, derivedKey, outputBitLength, secondaryMAC ) )
            }
        }

        /**
         * @private
         * @desc Determines whether a string is in the correct format of a message.
         * @param {string} message The input message.
         * @return {boolean} Returns true if the string message is valid.
         */
        static _isFormattedMessage( message ) {
            return typeof message === 'string' &&
                message.length > 2 &&
                message[ 0 ] === '`' &&
                message[ message.length - 1 ] === '`';
        }

        /**
         * @private
         * @desc Generates a nonce according to Discord's internal EPOCH. ( 14200704e5 )
         * @return {string} The string representation of the integer nonce.
         */
        static _getNonce() {
            // noinspection JSUnresolvedFunction
            return _cachedModules.NonceGenerator.fromTimestamp( Date.now() );
        }

        /**
         * @private
         * @desc Returns the name of the plugin file expected on the disk.
         * @returns {string}
         * @example
         * console.log( discordCrypt._getPluginName() );
         * // "discordCrypt.plugin.js"
         */
        static _getPluginName() {
            return 'discordCrypt.plugin.js';
        }

        /**
         * @private
         * @desc Check if the plugin is named correctly by attempting to open the plugin file in the BetterDiscord
         *      plugin path.
         * @returns {boolean}
         * @example
         * console.log( _discordCrypt._validPluginName() );
         * // False
         */
        static _validPluginName() {
            return require( 'fs' )
                .existsSync( require( 'path' )
                    .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() ) );
        }

        /**
         * @private
         * @desc Returns the platform-specific path to BetterDiscord's plugin directory.
         * @returns {string} The expected path ( which may not exist ) to BetterDiscord's plugin directory.
         * @example
         * console.log( _discordCrypt._getPluginsPath() );
         * // "C:\Users\John Doe\AppData\Local/BetterDiscord/plugins"
         */
        static _getPluginsPath() {
            const process = require( 'process' );
            const fs = require( 'fs' );

            const BETTERDISCORD_PATH = '/BetterDiscord/plugins/';
            const MAC_PATH = `${process.env.HOME}/Library/Preferences`;
            const DEB_PATH = `${process.env.HOME}.config`;

            switch( process.platform ) {
            case 'win32':
                return `${process.env.APPDATA}${BETTERDISCORD_PATH}`;
            case 'darwin':
                return `${MAC_PATH}${BETTERDISCORD_PATH}`;
            case 'linux':
                if( fs.existsSync( process.env.XDG_CONFIG_HOME ) )
                    return `${process.env.XDG_CONFIG_HOME}${BETTERDISCORD_PATH}`;
                return `${DEB_PATH}${BETTERDISCORD_PATH}`;
            default:
                _discordCrypt.log( `Unsupported platform detected: ${process.platform} ...`, 'error' );
                throw 'DEAD';
            }
        }

        /**
         * @private
         * @desc Checks if the plugin should ignore auto-updates.
         *      Usually in a developer environment, a simple symlink is ( or should be ) used to link the current build
         *      file to the plugin path allowing faster deployment.
         * @param {string} version Version string of the plugin to include in the check.
         * @return {boolean} Returns false if the plugin should auto-update.
         */
        static _shouldIgnoreUpdates( version ) {
            const fs = require( 'fs' );
            const path = require( 'path' );
            const plugin_file = path.join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );

            return fs.existsSync( plugin_file ) &&
            ( fs.lstatSync( plugin_file ).isSymbolicLink() || version.indexOf( '-debug' ) !== -1 );
        }

        /**
         * @private
         * @desc Checks the update server for an encrypted update.
         * @param {UpdateCallback} on_update_callback Callback to execute when an update is found.
         * @param {Array<UpdateInfo>} [blacklisted_updates] Optional list of blacklisted updates to ignore.
         * @returns {boolean}
         * @example
         * _checkForUpdate( ( info ) => {
         *      if( !info ) {
         *          console.log( 'No update available.' );
         *          return;
         *      }
         *      console.log( `New Update Available: #${info.hash} - v${info.version}` );
         *      console.log( `Signature is: ${info.valid ? valid' : 'invalid'}!` );
         *      console.log( `Changelog:\n${info.changelog}` );
         * } );
         */
        static _checkForUpdate( on_update_callback, blacklisted_updates ) {
            /* Update URL and request method. */
            const base_url = 'https://gitlab.com/leogx9r/discordCrypt/raw/master';
            const update_url = `${base_url}/build/${_discordCrypt._getPluginName()}`;
            const changelog_url = `${base_url}/CHANGELOG`;
            const signature_url = `${update_url}.sig`;

            /**
             * @desc Local update information.
             * @type {UpdateInfo}
             */
            let updateInfo = {
                version: '',
                payload: '',
                valid: false,
                hash: '',
                signature: '',
                changelog: ''
            };

            /* Make sure the callback is a function. */
            if ( typeof on_update_callback !== 'function' )
                return false;

            /* Perform the request. */
            try {
                /* Download the update. */
                _discordCrypt.__getRequest( update_url, ( statusCode, errorString, data ) => {
                    /* Make sure no error occurred. */
                    if ( statusCode !== 200 ) {
                        /* Log the error accordingly. */
                        switch ( statusCode ) {
                        case 404:
                            _discordCrypt.log( 'Update URL is broken.', 'error' );
                            break;
                        case 403:
                            _discordCrypt.log( 'Forbidden request when checking for updates.', 'error' );
                            break;
                        default:
                            _discordCrypt.log( `Error while fetching update: ${statusCode}:${errorString}`, 'error' );
                            break;
                        }

                        on_update_callback( null );
                        return false;
                    }

                    /* Get the local file. */
                    let localFile = '//META{"name":"discordCrypt"}*//\n';
                    try {
                        localFile = require( 'fs' ).readFileSync(
                            require( 'path' ).join(
                                _discordCrypt._getPluginsPath(),
                                _discordCrypt._getPluginName()
                            )
                        ).toString().replace( '\r', '' );
                    }
                    catch ( e ) {
                        _discordCrypt.log(
                            'Plugin file could not be locally read. Assuming testing version ...',
                            'warn'
                        );
                    }

                    /* Check the first line which contains the metadata to make sure that they're equal. */
                    if ( data.split( '\n' )[ 0 ] !== localFile.split( '\n' )[ 0 ] ) {
                        _discordCrypt.log(
                            'Plugin metadata is missing from either the local or update file.',
                            'error'
                        );

                        on_update_callback( null );
                        return false;
                    }

                    /* Read the current hash of the plugin and compare them.. */
                    // noinspection JSUnresolvedFunction
                    let currentHash = global.sha3.sha3_256( localFile.replace( '\r', '' ) );
                    // noinspection JSUnresolvedFunction
                    updateInfo.hash = global.sha3.sha3_256( data.replace( '\r', '' ) );

                    /* If the hash equals the retrieved one, no update is needed. */
                    if ( updateInfo.hash === currentHash ) {
                        _discordCrypt.log( `No Update Needed - #${updateInfo.hash.slice( 0, 16 )}` );

                        on_update_callback( null );
                        return true;
                    }

                    /* Check if the hash matches a blacklisted update. */
                    if(
                        blacklisted_updates &&
                        blacklisted_updates.length &&
                        blacklisted_updates.filter( e => e && e.hash === updateInfo.hash ).length !== 0
                    ) {
                        _discordCrypt.log( `Ignoring update - #${updateInfo.hash.slice( 0, 16 )}` );

                        on_update_callback( null );
                        return true;
                    }

                    /* Try parsing a version number. */
                    try {
                        updateInfo.version = data
                            .match( /((["'])(\d+\.)(\d+\.)(\*|\d+)(["']))/gi )
                            .toString()
                            .replace( /(['|"]*['|"])/g, '' );
                    }
                    catch ( e ) {
                        updateInfo.version = '?.?.?';
                        _discordCrypt.log( 'Failed to locate the version number in the update ...', 'warn' );
                    }

                    /* Basically the finally step - resolve the changelog & call the callback function. */
                    let tryResolveChangelog = ( valid_signature ) => {
                        /* Store the validity. */
                        updateInfo.valid = valid_signature;

                        /* Now get the changelog. */
                        try {
                            /* Fetch the changelog from the URL. */
                            _discordCrypt.__getRequest(
                                changelog_url,
                                ( statusCode, errorString, changelog ) => {
                                    updateInfo.changelog = statusCode == 200 ? changelog : '';

                                    /* Perform the callback. */
                                    on_update_callback( updateInfo );
                                }
                            );
                        }
                        catch ( e ) {
                            _discordCrypt.log( 'Error fetching the changelog.', 'warn' );

                            /* Perform the callback without a changelog. */
                            updateInfo.changelog = '';
                            on_update_callback( updateInfo );
                        }
                    };

                    /* Store the update. */
                    updateInfo.payload = data;

                    /* Try validating the signature. */
                    try {
                        /* Fetch the detached signature. */
                        _discordCrypt.__getRequest( signature_url, ( statusCode, errorString, detached_sig ) => {
                            /* Store the signature. */
                            updateInfo.signature = detached_sig;

                            /* Validate the signature then continue. */
                            let r = _discordCrypt.__validatePGPSignature(
                                updateInfo.payload,
                                updateInfo.signature,
                                _discordCrypt.__zlibDecompress( PGP_SIGNING_KEY )
                            );

                            /* This returns a Promise if valid or false if invalid. */
                            if( r )
                                r.then( ( valid_signature ) => tryResolveChangelog( valid_signature ) );
                            else
                                tryResolveChangelog( false );
                        } );
                    }
                    catch( e ) {
                        _discordCrypt.log( `Unable to validate the update signature: ${e}`, 'warn' );

                        /* Resolve the changelog anyway even without a valid signature. */
                        tryResolveChangelog( false );
                    }

                    return true;
                } );
            }
            catch ( ex ) {
                /* Handle failure. */
                _discordCrypt.log( `Error while retrieving update: ${ex.toString()}`, 'warn' );
                return false;
            }

            return true;
        }

        /**
         * @private
         * @description Returns the current message ID used by Discord.
         * @returns {string | undefined}
         * @example
         * console.log( _discordCrypt._getChannelId() );
         * // "414714693498014617"
         */
        static _getChannelId() {
            return window.location.pathname.split( '/' ).pop();
        }

        /**
         * @private
         * @desc Returns functions to locate exported webpack modules.
         * @returns {WebpackModuleSearcher}
         */
        static _getWebpackModuleSearcher() {
            /* [ Credits to the creator. ] */
            // noinspection JSUnresolvedFunction
            const req = typeof( webpackJsonp ) === "function" ?
                webpackJsonp(
                    [],
                    { '__extra_id__': ( module, _export_, req ) => _export_.default = req },
                    [ '__extra_id__' ]
                ).default :
                webpackJsonp.push( [
                    [],
                    { '__extra_id__': ( _module_, exports, req ) => _module_.exports = req },
                    [ [ '__extra_id__' ] ] ]
                );

            delete req.m[ '__extra_id__' ];
            delete req.c[ '__extra_id__' ];

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first one that matches filter
             *      predicate. At first this function will look through already loaded modules cache.
             *      If no loaded modules match, then this function tries to load all modules and match for them.
             *      Loading any module may have unexpected side effects, like changing current locale of moment.js,
             *      so in that case there will be a warning the console.
             *      If no module matches, this function returns `null`.
             *      ou should always try to provide a predicate that will match something,
             *      but your code should be ready to receive `null` in case of changes in Discord's codebase.
             *      If module is ES6 module and has default property, consider default first;
             *      otherwise, consider the full module object.
             * @param {ModulePredicate} filter Predicate to match module
             * @param {boolean} force_load Whether to force load all modules if cached modules don't work.
             * @return {*} First module that matches `filter` or `null` if none match.
             */
            const find = ( filter, force_load ) => {
                for ( let i in req.c ) {
                    if ( req.c.hasOwnProperty( i ) ) {
                        let m = req.c[ i ].exports;

                        if ( m && m.__esModule && m.default )
                            m = m.default;

                        if ( m && filter( m ) )
                            return m;
                    }
                }

                if ( force_load ) {
                    _discordCrypt.log( "Couldn't find module in existing cache. Loading all modules.", 'warn' );

                    for ( let i = 0; i < req.m.length; ++i ) {
                        try {
                            let m = req( i );
                            if ( m && m.__esModule && m.default && filter( m.default ) )
                                return m.default;
                            if ( m && filter( m ) )
                                return m;
                        }
                        catch ( e ) {
                            _discordCrypt.log( `Could not load module index ${i} ...`, 'warn' );
                        }
                    }

                    _discordCrypt.log( 'Cannot find Webpack module.', 'warn' );
                }

                return null;
            };

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has all of
             *      the following prototypes.
             * @param {string[]} protoNames Array of all prototypes to search for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @return {object} First module that matches `protoNames` or `null` if none match.
             */
            const findByUniquePrototypes = ( protoNames, force_load = false ) =>
                find(
                    module => protoNames.every( proto => module.prototype && module.prototype[ proto ] ),
                    force_load
                );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has all of the
             *      following properties. You should be ready that in any moment, after Discord update,
             *      this function may start returning `null` (if no such object exists anymore) or even some
             *      different object with the same properties. So you should provide all property names that
             *      you use, and often even some extra properties to make sure you'll get exactly what you want.
             * @param {string[]} propNames Array of property names to look for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @returns {object} First module that matches `propNames` or `null` if none match.
             */
            const findByUniqueProperties = ( propNames, force_load = false ) =>
                find( module => propNames.every( prop => module[ prop ] !== undefined ), force_load );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has the
             *      `displayName` property with following value. This is useful for searching for React components by
             *      name. Take into account that not all components are exported as modules. Also, there might be
             *      several components with the same name.
             * @param {string} displayName Display name property value to look for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @return {object} First module that matches `displayName` or `null` if none match.
             */
            const findByDisplayName = ( displayName, force_load = false ) =>
                find( module => module.displayName === displayName, force_load );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
             *      a dispatch token's ID. These usually contain a bundle of `_actionHandlers` used to handle events
             *      internally.
             * @param {int} token The internal token ID number.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @return {object} First module that matches the dispatch ID or `null` if none match.
             */
            const findByDispatchToken = ( token, force_load = false ) =>
                find(
                    module =>
                        module[ '_dispatchToken' ] &&
                        typeof module[ '_dispatchToken' ] === 'string' &&
                        module[ '_dispatchToken' ] === `ID_${token}` &&
                        module[ '_actionHandlers' ],
                    force_load
                );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
             *      every dispatcher name provided.
             * @param {string[]} dispatchNames Names of events to search for.
             * @return {object} First module that matches every dispatch name provided or null if no full matches.
             */
            const findByDispatchNames = dispatchNames => {
                for ( let i = 0; i < 500; i++ ) {
                    let dispatcher = findByDispatchToken( i );

                    if ( !dispatcher )
                        continue;

                    // noinspection JSUnresolvedVariable
                    if ( dispatchNames.every( prop => dispatcher._actionHandlers.hasOwnProperty( prop ) ) )
                        return dispatcher;
                }
                return null;
            };

            return {
                find,
                findByUniqueProperties,
                findByUniquePrototypes,
                findByDisplayName,
                findByDispatchToken,
                findByDispatchNames
            };
        }

        /**
         * @experimental
         * @private
         * @desc Dumps all function callback handlers with their names, IDs and function prototypes. [ Debug Function ]
         * @param {boolean} [dump_actions] Whether to dump action handlers.
         * @returns {Array} Returns an array of all IDs and identifier callbacks.
         */
        static _dumpWebpackModuleCallbacks( dump_actions = true ) {
            const ignored = [
                '_dependencies',
                '_isInitialized',
                'initialize',
                'initializeIfNeeded',
                'syncWith',
                'waitFor',
                'hasChangeCallbacks',
                'emitChange',
                'addChangeListener',
                'addConditionalChangeListener',
                'removeChangeListener',
                'getDispatchToken',
                'mustEmitChanges'
            ];

            /* Create the dumping array. */
            let dump = [], i = 0;

            /* Iterate over let's say 1000 possible modules ? */
            _discordCrypt._getWebpackModuleSearcher().find( ( module ) => {
                if( !module[ '__esModule' ] )
                    return false;

                /* Create an entry in the array. */
                dump[ i ] = {};

                /* Loop over every property in the module. */
                for( let prop in module ) {
                    /* Skip ignored. */
                    if( ignored.indexOf( prop ) !== -1 )
                        continue;

                    /* Dump action handlers. */
                    if( [ '_actionHandlers', '_dispatchHandlers', '_changeCallbacks' ].indexOf( prop ) !== -1 ) {
                        /* Skip if not required. */
                        if( !dump_actions )
                            continue;

                        dump[ i ][ prop ] = {};

                        /* Loop over every property name in the action handler. */
                        for ( let action in module[ prop ] ) {

                            /* Quick sanity check. */
                            // noinspection JSUnresolvedVariable
                            if ( !action.length || !module._actionHandlers.hasOwnProperty( action ) )
                                continue;

                            try{
                                /* Assign the module property name and it's basic prototype. */
                                dump[ i ][ prop ][ action ] =
                                    module[ prop ][ action ].prototype.constructor.toString().split( '{' )[ 0 ];
                            }
                            catch( e ) {
                                dump[ i ][ prop ] = 'N/A';
                            }
                        }
                    }
                    else {
                        try{
                            /* Add the actual property name and its prototype. */
                            dump[ i ][ prop ] = module[ prop ].toString().split( '{' )[ 0 ];
                        }
                        catch( e ) {
                            dump[ i ][ prop ] = 'N/A';
                        }
                    }
                }

                i++;
                return false;
            } );

            /* Return any found module handlers. */
            return dump;
        }

        /**
         * @private
         * @desc Returns the channel properties for the currently viewed channel or null.
         * @param {string} [channel_id] If specified, retrieves the channel properties for this channel.
         *      Else it retrieves the currently viewed channel's properties.
         * @return {object}
         */
        static _getChannelProps( channel_id ) {
            /* Blacklisted IDs that don't have actual properties. */
            const blacklisted_channel_props = [
                '@me',
                'activity'
            ];

            channel_id = channel_id || _discordCrypt._getChannelId();

            /* Skip blacklisted channels. */
            if( channel_id && blacklisted_channel_props.indexOf( channel_id ) === -1 )
                // noinspection JSUnresolvedFunction
                return _cachedModules.ChannelStore.getChannel( channel_id );

            /* Return nothing for invalid channels. */
            return null;
        }

        /**
         * @private
         * @desc Delete the message from the channel indicated.
         * @param {string} channel_id The channel's identifier that the message is located in.
         * @param {string} message_id The message's identifier to delete.
         * @param {CachedModules} cached_modules The internally cached module objects.
         */
        static _deleteMessage( channel_id, message_id, cached_modules ) {
            /* Delete the message internally. */
            // noinspection JSUnresolvedFunction
            cached_modules.MessageController.deleteMessage( channel_id, message_id );
        }

        /**
         * @private
         * @desc Sends either an embedded message or an inline message to Discord.
         * @param {string} message The main content to send.
         * @param {int} [channel_id] Sends the embedded message to this channel instead of the current channel.
         * @param {number} [timeout] Optional timeout to delete this message in minutes.
         */
        static _dispatchMessage( message, channel_id = null, timeout = null ) {
            if( !message.length )
                return;

            /* Save the Channel ID. */
            let _channel = channel_id || _discordCrypt._getChannelId();

            /* Handles returns for messages. */
            const onDispatchResponse = ( r ) => {
                /* Check if an error occurred and inform Clyde bot about it. */
                if ( !r.ok ) {
                    /* Perform Clyde dispatch if necessary. */
                    // noinspection JSUnresolvedFunction
                    if (
                        r.status >= 400 &&
                        r.status < 500 &&
                        r.body &&
                        !_cachedModules.MessageController.sendClydeError( _channel, r.body.code )
                    ) {
                        /* Log the error in case we can't manually dispatch the error. */
                        _discordCrypt.log( `Error sending message: ${r.status}`, 'error' );

                        /* Sanity check. */
                        if ( _cachedModules.EventDispatcher === null || _cachedModules.GlobalTypes === null ) {
                            _discordCrypt.log( 'Could not locate the EventDispatcher module!', 'error' );
                            return;
                        }

                        // noinspection JSUnresolvedVariable
                        _cachedModules.EventDispatcher.dispatch( {
                            type: _cachedModules.GlobalTypes.ActionTypes.MESSAGE_SEND_FAILED,
                            messageId: r.body.id,
                            channelId: _channel
                        } );
                    }
                }
                else {
                    /* Receive the message normally. */
                    // noinspection JSUnresolvedFunction
                    _cachedModules.MessageController.receiveMessage( _channel, r.body );

                    /* Calculate the timeout. */
                    timeout = timeout || _configFile.timedMessageExpires;

                    /* Add the message to the TimedMessage array. */
                    if ( _configFile.timedMessages && _configFile.timedMessageExpires > 0 ) {
                        _configFile.timedMessages.push( {
                            messageId: r.body.id,
                            channelId: _channel,
                            expireTime: Date.now() + ( timeout * 60000 )
                        } );
                    }
                }
            };

            /* Create the message object and dispatch it to the queue. */
            _cachedModules.MessageQueue.original_enqueue(
                {
                    type: 'send',
                    message: {
                        channelId: _channel,
                        nonce: _discordCrypt._getNonce(),
                        content: message,
                        tts: false
                    }
                },
                onDispatchResponse
            );
        }

        /**
         * @private
         * @desc Injects a CSS style element into the header tag.
         * @param {string} id The HTML ID string used to identify this CSS style segment.
         * @param {string} css The actual CSS style excluding the <style> tags.
         * @example
         * _injectCSS( 'my-css', 'p { font-size: 32px; }' );
         */
        static _injectCSS( id, css ) {
            /* Inject into the header tag. */
            $( "head" )
                .append( $( "<style>", { id: id.replace( /^[^a-z]+|[^\w-]+/gi, "" ), html: css } ) )
        }

        /**
         * @private
         * @author samogot
         * @desc This function monkey-patches a method on an object.
         *      The patching callback may be run before, after or instead of target method.
         *      Be careful when monkey-patching. Think not only about original functionality of target method and your
         *      changes, but also about developers of other plugins, who may also patch this method before or after you.
         *      Try to change target method behaviour as little as possible, and avoid changing method signatures.
         *
         *      By default, this function logs to the console whenever a method is patched or unpatched in order to aid
         *      debugging by you and other developers, but these messages may be suppressed with the `silent` option.
         *
         *      Display name of patched method is changed, so you can see if a function has been patched
         *      ( and how many times ) while debugging or in the stack trace. Also, patched methods have property
         *      `__monkeyPatched` set to `true`, in case you want to check something programmatically.
         *
         * @param {object} what Object to be patched.
         *      You can can also pass class prototypes to patch all class instances.
         *      If you are patching prototype of react component you may also need.
         * @param {string} methodName The name of the target message to be patched.
         * @param {object} options Options object. You should provide at least one of `before`, `after` or `instead`
         *      parameters. Other parameters are optional.
         * @param {PatchCallback} options.before Callback that will be called before original target
         *      method call. You can modify arguments here, so it will be passed to original method.
         *      Can be combined with `after`.
         * @param {PatchCallback} options.after Callback that will be called after original
         *      target method call. You can modify return value here, so it will be passed to external code which calls
         *      target method. Can be combined with `before`.
         * @param {PatchCallback} options.instead Callback that will be called instead of original target method call.
         *      You can get access to original method using `originalMethod` parameter if you want to call it,
         *      but you do not have to. Can't be combined with `before` and `after`.
         * @param {boolean} [options.once=false] Set to `true` if you want to automatically unpatch method after
         *      first call.
         * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about
         *      patching and unpatching. Useful to avoid clogging the console in case of frequent conditional
         *      patching/unpatching, for example from another monkeyPatch callback.
         * @param {string} [options.displayName] You can provide meaningful name for class/object provided in
         *      `what` param for logging purposes. By default, this function will try to determine name automatically.
         * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesn't exist.
         *      ( Adds noop function in place. )
         * @return {{original: function(), cancel: function()}} Function with no arguments and no return value
         *      that should be called to cancel this patch. You should save and run it when your plugin is stopped.
         *      Also returns the original function.
         */
        static _monkeyPatch( what, methodName, options ) {
            /**
             * Wraps the method in a `try..catch` block.
             * @param {function} method - method to wrap
             * @param {string} description - description of method
             * @returns {function} wrapped version of method
             */
            const suppressErrors = ( method, description ) => ( ... params ) => {
                try {
                    return method( ... params );
                }
                catch ( e ) {
                    _discordCrypt.log( `Error while '${description}'`, 'error' );
                }
                return undefined;
            };

            /* Grab options. */
            const { before, after, instead, once = false, silent = false, forcePatch = false } = options;

            /* Determine the display name for logging. */
            const displayName = options.displayName || what.displayName || what.name ||
                what.constructor.displayName || what.constructor.name;

            /* Log if required. */
            if ( !silent )
                _discordCrypt.log( `Hooking ${methodName} ...` );

            /* Backup the original method for unpatching or restoring. */
            let origMethod = what[ methodName ];

            /* If a method can't be found, handle appropriately based on if forcing patches. */
            if ( !origMethod ) {
                if ( !forcePatch ) {
                    /* Log and bail out. */
                    _discordCrypt.log(
                        `Can't find non-existent method '${displayName}.${methodName}' to hook.`,
                        'error'
                    );
                    let null_fn =  () => {
                        /* Ignore. */
                    };
                    return {
                        original: null_fn,
                        cancel: null_fn
                    }
                }
                else {
                    /* Assign empty functions. */
                    what[ methodName ] = function() {
                        /* Ignore. */
                    };
                    origMethod = function() {
                        /* Ignore. */
                    };
                }
            }

            /* Create a callback that can cancel the patch. */
            const cancel = () => {
                /* Log if appropriate. */
                if ( !silent )
                    _discordCrypt.log( `Unhooking method: '${displayName}.${methodName}' ...` );

                /* Restore the original method thus removing the patch. */
                what[ methodName ] = origMethod;
            };

            /* Apply a wrapper function that calls the callbacks based on the options. */
            what[ methodName ] = function() {
                /**
                 * @desc Contains the local patch state for this function.
                 * @type {PatchData}
                 */
                const data = {
                    thisObject: this,
                    methodArguments: arguments,
                    cancelPatch: cancel,
                    originalMethod: origMethod,
                    callOriginalMethod: () =>
                        data.returnValue = data.originalMethod.apply( data.thisObject, data.methodArguments )
                };

                /* Call the callback instead of the method with the defined return value if any. */
                if ( instead ) {
                    const tempRet = suppressErrors(
                        instead,
                        `calling override instead of original for '${what[ methodName ].displayName}'`
                    )( data );

                    if ( tempRet !== undefined )
                        data.returnValue = tempRet;
                }
                else {
                    /* Handle execution before the method call. */
                    if ( before )
                        suppressErrors(
                            before,
                            `calling override before '${what[ methodName ].displayName}'`
                        )( data );

                    /* Actually call the original method. */
                    data.callOriginalMethod();

                    /* Handle execution after the method call. */
                    if ( after )
                        suppressErrors(
                            after,
                            `calling override after '${what[ methodName ].displayName}'`
                        )( data );
                }

                /* If this function hook is just being executed once, unhook it now. */
                if ( once )
                    cancel();

                return data.returnValue;
            };

            /* Make sure the method is marked as hooked. */
            // noinspection JSUnusedGlobalSymbols
            what[ methodName ].__monkeyPatched = true;
            what[ methodName ].displayName = `Hooked ${what[ methodName ].displayName || methodName}`;

            /* Save the unhook method to the object. */
            // noinspection JSUnusedGlobalSymbols
            what[ methodName ].unpatch = cancel;

            /* Store the cancel callback. */
            _stopCallbacks.push( cancel );

            /* Return the callback necessary for cancelling and the original function. */
            return {
                original: origMethod,
                cancel: cancel
            };
        }

        /* ========================================================= */

        /* ======================= UTILITIES ======================= */

        /**
         * @public
         * @desc Logs a message to the console in HTML coloring. ( For Electron clients. )
         * @param {string} message The message to log to the console.
         * @param {string} method The indication level of the message.
         *      This can be either ['info', 'warn', 'error', 'success']
         *
         * @example
         * log( 'Hello World!' );
         *
         * @example
         * log( 'This is printed in yellow.', 'warn' );
         *
         * @example
         * log( 'This is printed in red.', 'error' );
         *
         * @example
         * log( 'This is printed green.', 'trace' );
         *
         * @example
         * log( 'This is printed green.', 'debug' );
         *
         */
        static log( message, method = "info" ) {
            try {
                console[ method ](
                    `%c[DiscordCrypt]%c - ${message}`,
                    "color: #7f007f; font-weight: bold; text-shadow: 0 0 1px #f00, 0 0 2px #f0f, 0 0 3px #00f;",
                    ""
                );
            }
            catch ( ex ) {
                console.error( '[DiscordCrypt] - Error logging message ...' );
            }
        }

        /**
         * @private
         * @desc Builds a random captcha phrase to validate user input.
         * @param {number} word_count The number of words to use for the captcha.
         * @return {{passphrase: string, captcha: string}}
         */
        static __generateWordCaptcha( word_count = 5 ) {
            /* Generator for determining which character set to choose from. */
            const randomBytes = require( 'crypto' ).randomBytes;

            /* Stores the result captcha. */
            let captcha = '';

            /* This uses a converter to transform the text. */
            const CONVERTER = [
                    /* REGULAR */
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

                    /* SMALLCAPS */
                    'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ',

                    /* SUPERSCRIPT */
                    'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁνᵂˣʸᶻ'
                ],
                ALPHABET = CONVERTER[ 0 ].toLowerCase();

            /* Generate a random passphrase. */
            let passphrase = _discordCrypt.__generateDicewarePassphrase( word_count );

            /* Split the passphrase into words. */
            let words = passphrase.passphrase.split( ' ' );

            /* Iterate each word to build the captcha. */
            for( let i = 0; i < words.length; i++ ) {
                /* Generate a random sequence to pick the word list from. */
                let rand = randomBytes( words[ i ].length );

                /* Build a new word using the random word lists. */
                for( let j = 0; j < words[ i ].length; j++ )
                    captcha += CONVERTER[ rand[ j ] % CONVERTER.length ][ ALPHABET.indexOf( words[ i ][ j ] ) ];

                /* Add the space. */
                captcha += ' ';
            }

            /* Return the captcha and expected values. */
            return {
                passphrase: passphrase.passphrase,
                captcha: captcha.trim(),
            }
        }

        /**
         * @private
         * @desc Determines which of the two buffers specified contains a larger value.
         * @param {Buffer|Uint8Array} a The first buffer.
         * @param {Buffer|Uint8Array} b The second buffer.
         */
        static __binaryCompare( a, b ) {
            /* Do a simple comparison on the buffers. */
            // noinspection JSUnresolvedFunction
            switch( a.compare( b ) ) {
            /* b > a */
            case 1:
                return b;
            /* a > b */
            case -1:
                return a;
            /* a === b */
            case 0:
            default:
                return a;
            }
        }

        /**
         * @private
         * @desc Checks if the input password is at least 8 characters long,
         *      is alpha-numeric with both upper and lowercase as well as contains at least one symbol.
         *      Alternatively checks if the input is at least 64 characters to bypass the above check.
         *      Alerts the user if both conditions do not pass.
         * @param {string} input The input password to validate.
         * @return {boolean} Returns true if the password is valid.
         */
        static __validatePasswordRequisites( input ) {
            if(
                input.length < 32 &&
                !( new RegExp( /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/g ) ).test( input )
            ) {
                global.smalltalk.alert(
                    'Invalid Password Input',
                    'Your password <b>must be at least 8 characters</b> long and <u>must</u> contain ' +
                    'a combination of alpha-numeric characters both uppercase and lowercase ( A-Z, a-z, 0-9 ) ' +
                    'as well as at least one symbol <b>OR</b> be greater than 32 characters for the best security.' +
                    '<br/><br/><br/>' +
                    'Please enter a password meeting these requirements.<br/>' +
                    'We recommend you use a password manager like KeePassX or KeePassXC to easily store these.'
                );
                return false;
            }

            return true;
        }

        /**
         * @private
         * @desc Verifies an OpenPGP signed message using the public key provided.
         * @param {string} message The raw message.
         * @param {string} signature The ASCII-armored signature in a detached form.
         * @param {string} public_key The ASCII-armored public key.
         * @return {boolean} Returns true if the message is valid.
         */
        static async __validatePGPSignature( message, signature, public_key ) {
            if( typeof global === 'undefined' || !global.openpgp )
                return false;

            let options = {
                message: global.openpgp.message.fromText( message ),
                signature: await global.openpgp.signature.readArmored( signature ),
                publicKeys: ( await global.openpgp.key.readArmored( public_key ) ).keys
            };

            return global.openpgp.verify( options ).then( ( validity ) => validity.signatures[ 0 ].valid );
        }

        /**
         * @public
         * @desc Compresses the input data using ZLIB.
         * @param {string|Buffer} data The input data to compress.
         * @param {string} [format] The format of the input data.
         * @param {string} [outForm] If specified, returns the compressed
         *      data in this format otherwise it returns a Buffer.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         * @return {string|Buffer} The compressed data.
         */
        static __zlibCompress( data, format = 'base64', outForm ) {
            let v = require( 'zlib' ).deflateSync(
                Buffer.isBuffer( data ) ? data : Buffer.from( data, format ),
                { windowBits: 15 }
            );

            return outForm ? v.toString( outForm ) : v;
        }

        /**
         * @public
         * @desc Decompresses an encoded ZLIB package.
         * @param {string|Buffer} data The input data to decompress.
         * @param {string} [format] The format of the input data.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         *      Defaults to Base64.
         * @param {string} [outForm] If specified, returns the decompressed
         *      data in this format otherwise it returns a Buffer.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         * @return {string|Buffer} The original data.
         */
        static __zlibDecompress( data, format = 'base64', outForm = 'utf8' ) {
            let v = require( 'zlib' ).inflateSync(
                Buffer.isBuffer( data ) ? data : Buffer.from( data, format ),
                { windowBits: 15 }
            );

            return outForm ? v.toString( outForm ) : v;
        }

        /**
         * @public
         * @desc Loads all compiled libraries as needed.
         * @param {LibraryDefinition} libs A list of all libraries to load.
         */
        static __loadLibraries( libs = EXTERNAL_LIBRARIES ) {
            const vm = require( 'vm' );

            /* Inject all compiled libraries based on if they're needed */
            for ( let name in libs ) {
                let libInfo = libs[ name ];

                /* Browser code requires a window object to be defined. */
                if ( libInfo.requiresBrowser && typeof window === 'undefined' ) {
                    _discordCrypt.log( `Skipping loading of browser-required plugin: ${name} ...`, 'warn' );
                    continue;
                }

                /* Decompress the Base64 code. */
                let code = _discordCrypt.__zlibDecompress( libInfo.code );

                /* Determine how to run this. */
                if ( libInfo.requiresBrowser || libInfo.requiresNode ) {
                    /* Run in the current context as it operates on currently defined objects. */
                    _discordCrypt.log( `Running ${name} in current VM context ...` );
                    vm.runInThisContext(
                        code,
                        {
                            filename: name,
                            displayErrors: false
                        }
                    );
                }
                else {
                    /* Run in a new sandbox and store the result in a global object. */
                    _discordCrypt.log( `Running ${name} in isolated VM context ...` );
                    global[ name.replace( '.js', '' ) ] =
                        vm.runInNewContext(
                            code,
                            {
                                filename: name,
                                displayErrors: false
                            }
                        );
                }
            }
        }

        /**
         * @public
         * @desc Performs an HTTP request returns the result to the callback.
         * @param {string} url The URL of the request.
         * @param {GetResultCallback} callback The callback triggered when the request is complete or an error occurs.
         * @param {any|null} [encoding] If null is passed the result will be returned as a Buffer otherwise as a string.
         * @return {Promise<any>}
         */
        static __getRequest( url, callback, encoding = undefined ) {
            try {
                return require( 'request' )(
                    {
                        url: url,
                        gzip: true,
                        encoding: encoding,
                        removeRefererHeader: true
                    },
                    ( error, response, result ) => {
                        callback( response.statusCode, error || response.statusMessage, result );
                    }
                );
            }
            catch ( ex ) {
                callback( -1, ex.toString() );
                return null;
            }
        }

        /**
         * @private
         * @desc Encodes a public key buffer into the format required.
         * @param {Buffer|Uint8Array} rawKey The raw public key buffer.
         * @param {number} index The algorithm's index related to the public key being encoded.
         * @return {string}
         */
        static __encodeExchangeKey( rawKey, index ) {
            const MAX_SALT_LEN = 32;
            const MIN_SALT_LEN = 16;

            /* Required for generating a random salt. */
            const crypto = require( 'crypto' );

            /* Calculate a random salt length. */
            let saltLen = (
                parseInt( crypto.randomBytes( 1 ).toString( 'hex' ), 16 ) % ( MAX_SALT_LEN - MIN_SALT_LEN )
            ) + MIN_SALT_LEN;

            /* Create a blank payload. */
            let rawBuffer = Buffer.alloc( 2 + saltLen + rawKey.length );

            /* Write the algorithm index. */
            rawBuffer.writeInt8( index, 0 );

            /* Write the salt length. */
            rawBuffer.writeInt8( saltLen, 1 );

            /* Generate a random salt and copy it to the buffer. */
            crypto.randomBytes( saltLen ).copy( rawBuffer, 2 );

            /* Copy the public key to the buffer. */
            rawKey.copy( rawBuffer, 2 + saltLen );

            /* Split the message by adding a new line every 32 characters like a standard PGP message. */
            return  ENCODED_KEY_HEADER + _discordCrypt.__substituteMessage( rawBuffer, true );
        }

        /**
         * @public
         * @desc Returns the exchange algorithm and bit size for the given metadata as well as a fingerprint.
         * @param {string|Buffer} key_message The encoded metadata to extract the information from.
         * @param {boolean} [header_present] Whether the message's magic string is attached to the input.
         * @returns {PublicKeyInfo|null} Returns the algorithm's bit length and name or null.
         * @example
         * __extractExchangeKeyInfo( public_key, true );
         * @example
         * __extractExchangeKeyInfo( public_key, false );
         */
        static __extractExchangeKeyInfo( key_message, header_present = false ) {
            try {
                let output = [];
                let msg = key_message.replace( /\r?\n|\r/g, '' );

                /* Strip the header if necessary. */
                if ( header_present )
                    msg = msg.slice( 4 );

                /* Decode the message to hex. */
                msg = _discordCrypt.__substituteMessage( msg );

                /* Decode the message to raw bytes. */
                msg = Buffer.from( msg, 'hex' );

                /* Sanity check. */
                if ( !_discordCrypt.__isValidExchangeAlgorithm( msg[ 0 ] ) )
                    return null;

                /* Create a fingerprint for the blob. */
                // noinspection JSUnresolvedFunction
                output[ 'fingerprint' ] = global.sha3.sha3_256( msg );

                /* Buffer[0] contains the algorithm type. Reverse it. */
                output[ 'index' ] = parseInt( msg[ 0 ] );
                output[ 'bit_length' ] = _discordCrypt.__indexToAlgorithmBitLength( msg[ 0 ] );
                output[ 'algorithm' ] = _discordCrypt.__indexToExchangeAlgorithmString( msg[ 0 ] )
                    .split( '-' )[ 0 ].toLowerCase();

                /* Get the salt length. */
                let salt_len = msg.readInt8( 1 );

                /* Make sure the salt length is valid. */
                if ( salt_len < 16 || salt_len > 32 )
                    return null;

                /* Read the public salt. */
                // noinspection JSUnresolvedFunction
                output[ 'salt' ] = Buffer.from( msg.subarray( 2, 2 + salt_len ) );

                /* Read the key. */
                // noinspection JSUnresolvedFunction
                output[ 'key' ] = Buffer.from( msg.subarray( 2 + salt_len ) );

                return output;
            }
            catch ( e ) {
                return null;
            }
        }

        /**
         * @public
         * @desc Smartly splits the input text into chunks according to the specified length while
         *      attempting to preserve word spaces unless they exceed the limit.
         * @param {string} input_string The input string.
         * @param {int} max_length The maximum length of the string before splitting.
         * @returns {Array} An array of split strings.
         * @private
         */
        static __splitStringChunks( input_string, max_length ) {
            /* Sanity check. */
            if ( !max_length || max_length <= 1 )
                return input_string;

            /* Split the string into words. */
            const words = input_string.split( ' ' );

            /* Create vars for storing the result, current string and first-word flag. */
            let ret = [], current = '', first = true;

            /* Iterate over all words. */
            words.forEach( word => {
                /* Check if the current string would overflow if the word was added. */
                if( ( current.length + word.length ) > max_length && current.length ) {
                    /* Insert the string into the array and reset it. */
                    ret.push( current );

                    /* Reset the sentence. */
                    current = '';
                }

                /* Add the current word to the sentence without a space only if it's the first word. */
                if( first ) {
                    current += word;
                    first = false;
                }
                else
                    current += ` ${word}`;

                /* If the current sentence is longer than the maximum, split it and add to the result repeatedly. */
                while( current.length > max_length ) {
                    /* Add it to the array. */
                    ret.push( current.substr( 0, max_length ) );

                    /* Get the remaining. */
                    current = current.substr( max_length );
                }
            } );

            /* If the current sentence has something, add it to the array. */
            if( current.length )
                ret.push( current );

            return ret;
        }

        /**
         * @public
         * @desc Returns a string, Buffer() or Array() as a buffered object.
         * @param {string|Buffer|Array} input The input variable.
         * @param {boolean|undefined} [is_input_hex] If set to true, the input is parsed as a hex string. If false, it
         *      is parsed as a Base64 string. If this value is undefined, it is parsed as a UTF-8 string.
         * @returns {Buffer} Returns a Buffer object.
         * @throws {string} Thrown an unsupported type error if the input is neither a string, Buffer or Array.
         */
        static __toBuffer( input, is_input_hex = undefined ) {

            /* No conversion needed, return it as-is. */
            if ( Buffer.isBuffer( input ) )
                return input;

            /* If the message is either a Hex, Base64 or UTF-8 encoded string, convert it to a buffer. */
            if ( typeof input === 'string' )
                return Buffer.from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );

            /* Convert the Array to a Buffer object first. */
            if ( Array.isArray( input ) )
                return Buffer.from( input );

            /* Throw if an invalid type was passed. */
            throw 'Input is neither an Array(), Buffer() or a string.';
        }

        /**
         * @public
         * @desc Returns the string encoded mime type of a file based on the file extension.
         * @param {string} file_path The path to the file in question.
         * @returns {string} Returns the known file extension's MIME type or "application/octet-stream".
         */
        static __getFileMimeType( file_path ) {
            /* Look up the Mime type from the file extension. */
            let type = require( 'mime-types' ).lookup( require( 'path' ).extname( file_path ) );

            /* Default to an octet stream if it fails. */
            return type === false ? 'application/octet-stream' : type;
        }

        /**
         * @private
         * @desc Attempts to read the clipboard and converts either Images or text to raw Buffer() objects.
         * @returns {ClipboardInfo} Contains clipboard data. May be null.
         */
        static __clipboardToBuffer() {
            /* Request the clipboard object. */
            let { clipboard } = require( 'electron' );

            /* Sanity check. */
            if ( !clipboard )
                return { mime_type: '', name: '', data: null };

            /* We use original-fs to bypass any file-restrictions ( Eg. ASAR ) for reading. */
            let fs = require( 'original-fs' ),
                path = require( 'path' );

            /* The clipboard must have at least one type available. */
            // noinspection JSUnresolvedFunction
            if ( clipboard.availableFormats().length === 0 )
                return { mime_type: '', name: '', data: null };

            /* Get all available formats. */
            // noinspection JSUnresolvedFunction
            let mime_type = clipboard.availableFormats();
            let data, tmp = '', name = '', is_file = false;

            /* Loop over each format backwards and try getting the data. */
            for ( let i = mime_type.length - 1; i >= 0; i-- ) {
                let format = mime_type[ i ].split( '/' );

                /* For types, prioritize images. */
                switch ( format[ 0 ] ) {
                case 'image':
                    /* Convert the image type. */
                    switch ( format[ 1 ].toLowerCase() ) {
                    case 'png':
                        // noinspection JSUnresolvedFunction
                        data = clipboard.readImage().toPNG();
                        break;
                    case 'bmp':
                    case 'bitmap':
                        // noinspection JSUnresolvedFunction
                        data = clipboard.readImage().toBitmap();
                        break;
                    case 'jpg':
                    case 'jpeg':
                        // noinspection JSUnresolvedFunction
                        data = clipboard.readImage().toJPEG( 100 );
                        break;
                    default:
                        break;
                    }
                    break;
                case 'text':
                    /* Resolve what's in the clipboard. */
                    // noinspection JSUnresolvedFunction
                    tmp = clipboard.readText();

                    try {
                        /* Check if this is a valid file path. */
                        let stat = fs.statSync( tmp );

                        /* Check if this is a file. */
                        if ( stat.isFile() ) {
                            /* Read the file and store the file name. */
                            data = fs.readFileSync( tmp );
                            name = path.basename( tmp );
                            is_file = true;
                        }
                        else {
                            /* This isn't a file. Assume we want to upload the path itself as text. */
                            data = Buffer.from( tmp, 'utf8' );
                        }
                    }
                    catch ( e ) {
                        /* Convert the text to a buffer. */
                        data = Buffer.from( tmp, 'utf8' );
                    }
                    break;
                default:
                    break;
                }

                /* Keep trying till it has at least a byte of data to return. */
                if ( data && data.length > 0 ) {
                    /* If this is a file, try getting the file's MIME type. */
                    if ( is_file )
                        mime_type[ i ] = _discordCrypt.__getFileMimeType( tmp );

                    /* Return the data. */
                    return {
                        mime_type: mime_type[ i ],
                        name: name,
                        data: data
                    }
                }
            }

            return { mime_type: '', name: '', data: null };
        }

        /**
         * @public
         * @desc Converts a seed to the encryption keys used in the Up1 protocol.
         * @param {string|Buffer|Uint8Array} seed
         * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
         * @return {{seed: *, key: *, iv: *, ident: *}}
         */
        static __up1SeedToKey( seed, sjcl ) {
            /* Convert the seed either from a string to Base64 or read it via raw bytes. */
            if ( typeof seed === 'string' )
                seed = sjcl.codec.base64url.toBits( seed );
            else
                seed = sjcl.codec.bytes.toBits( seed );

            /* Compute an SHA-512 hash. */
            let out = sjcl.hash.sha512.hash( seed );

            /* Calculate the output values based on Up1's specs. */
            return {
                seed: seed,
                key: sjcl.bitArray.bitSlice( out, 0, 256 ),
                iv: sjcl.bitArray.bitSlice( out, 256, 384 ),
                ident: sjcl.bitArray.bitSlice( out, 384, 512 )
            }
        }

        /**
         * @public
         * @desc Encrypts the specified buffer to Up1's format specifications and returns this data to the callback.
         * @param {Buffer} data The input buffer to encrypt.
         * @param {string} mime_type The MIME type of this file.
         * @param {string} file_name The name of this file.
         * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
         * @param {EncryptedFileCallback} callback The callback function that will be called on error or completion.
         * @param {Buffer} [seed] Optional seed to use for the generation of keys.
         */
        static __up1EncryptBuffer( data, mime_type, file_name, sjcl, callback, seed ) {
            const crypto = require( 'crypto' );

            /* Converts a string to its UTF-16 equivalent in network byte order. */
            function str2ab( /* string */ str ) {
                /* UTF-16 requires 2 bytes per UTF-8 byte. */
                let buf = Buffer.alloc( str.length * 2 );

                /* Loop over each byte. */
                for ( let i = 0, strLen = str.length; i < strLen; i++ ) {
                    /* Write the UTF-16 equivalent in Big Endian. */
                    buf.writeUInt16BE( str.charCodeAt( i ), i * 2 );
                }

                return buf;
            }

            try {
                /* Make sure the file size is less than 50 MB. */
                if ( data.length > 50000000 ) {
                    callback( 'Input size must be < 50 MB.' );
                    return;
                }

                /* Calculate the upload header and append the file data to it prior to encryption. */
                data = Buffer.concat( [
                    str2ab( JSON.stringify( { 'mime': mime_type, 'name': file_name } ) ),
                    Buffer.from( [ 0, 0 ] ),
                    data
                ] );

                /* Convert the file to a Uint8Array() then to SJCL's bit buffer. */
                data = sjcl.codec.bytes.toBits( new Uint8Array( data ) );

                /* Generate a random 512 bit seed and calculate the key and IV from this. */
                let params = _discordCrypt.__up1SeedToKey( seed || crypto.randomBytes( 64 ), sjcl );

                /* Perform AES-256-CCM encryption on this buffer and return an ArrayBuffer() object. */
                data = sjcl.mode.ccm.encrypt( new sjcl.cipher.aes( params.key ), data, params.iv );

                /* Execute the callback. */
                callback(
                    null,
                    Buffer.from( sjcl.codec.bytes.fromBits( data ) ),
                    sjcl.codec.base64url.fromBits( params.ident ),
                    sjcl.codec.base64url.fromBits( params.seed )
                );
            }
            catch ( ex ) {
                callback( ex.toString() );
            }
        }

        /**
         * @public
         * @desc Decrypts the specified data as per Up1's spec.
         * @param {Buffer} data The encrypted buffer.
         * @param {string} seed A base64-URL encoded string.
         * @param {Object} sjcl The Stanford Javascript Library object.
         * @return {{header: Object, data: Blob}}
         */
        static __up1DecryptBuffer( data, seed, sjcl ) {
            /* Constant as per the Up1 protocol. Every file contains these four bytes: "Up1\0". */
            const file_header = [ 85, 80, 49, 0 ];

            let has_header = true, idx = 0, header = '', view;

            /* Retrieve the AES key and IV. */
            let params = _discordCrypt.__up1SeedToKey( seed, sjcl );

            /* Convert the buffer to a Uint8Array. */
            let _file = new Uint8Array( data );

            /* Scan for the file header. */
            for ( let i = 0; i < file_header.length; i++ ) {
                if ( _file[ i ] != file_header[ i ] ) {
                    has_header = false;
                    break
                }
            }

            /* Remove the header if it exists. */
            if ( has_header )
                _file = _file.subarray( file_header.length );

            /* Decrypt the blob. */
            let decrypted = sjcl.mode.ccm.decrypt(
                new sjcl.cipher.aes( params.key ),
                sjcl.codec.bytes.toBits( _file ),
                params.iv
            );

            /* The header is a JSON encoded UTF-16 string at the top. */
            view = new DataView( ( new Uint8Array( sjcl.codec.bytes.fromBits( decrypted ) ) ).buffer );
            for ( ; ; idx++ ) {
                /* Get the UTF-16 byte at the position. */
                let num = view.getUint16( idx * 2, false );

                /* Break on null terminators. */
                if ( num === 0 )
                    break;

                /* Add to the JSON string. */
                header += String.fromCharCode( num );
            }

            /* Return the header object and the decrypted data. */
            header = JSON.parse( header );
            return {
                header: header,
                data: Buffer.from( sjcl.codec.bytes.fromBits( decrypted ) )
                    .slice( ( idx * 2 ) + 2, data.length ),
                blob: ( new Blob( [ decrypted ], { type: header.mime } ) )
                    .slice( ( idx * 2 ) + 2, data.length, header.mime )
            };
        }

        /**
         * @public
         * @desc Performs AES-256 CCM encryption of the given file and converts it to the expected Up1 format.
         * @param {string} file_path The path to the file to encrypt.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {EncryptedFileCallback} callback The callback function for when the file has been encrypted.
         * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata.
         *      Default: False.
         */
        static __up1EncryptFile( file_path, sjcl, callback, randomize_file_name = false ) {
            const crypto = require( 'crypto' );
            const path = require( 'path' );
            const fs = require( 'original-fs' );

            try {
                /* Make sure the file size is less than 50 MB. */
                if ( fs.statSync( file_path ).size > 50000000 ) {
                    callback( 'File size must be < 50 MB.' );
                    return;
                }

                /* Read the file in an async callback. */
                fs.readFile( file_path, ( error, file_data ) => {
                    /* Check for any errors. */
                    if ( error !== null ) {
                        callback( error.toString() );
                        return;
                    }

                    /* Encrypt the file data. */
                    _discordCrypt.__up1EncryptBuffer(
                        file_data,
                        _discordCrypt.__getFileMimeType( file_path ),
                        randomize_file_name ?
                            crypto.pseudoRandomBytes( 8 ).toString( 'hex' ) + path.extname( file_path ) :
                            path.basename( file_path ),
                        sjcl,
                        callback
                    )
                } );
            }
            catch ( ex ) {
                callback( ex.toString() );
            }
        }

        /**
         * @public
         * @desc Uploads raw data to an Up1 service and returns the file URL and deletion key.
         * @param {string} up1_host The host URL for the Up1 service.
         * @param {string} [up1_api_key] The optional API key used for the service.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {UploadedFileCallback} callback The callback function called on success or failure.
         * @param {ClipboardInfo} [clipboard_data] Optional clipboard data.
         */
        static __up1UploadClipboard( up1_host, up1_api_key, sjcl, callback, clipboard_data = undefined ) {
            /* Get the current clipboard data. */
            let clipboard = clipboard_data === undefined ? _discordCrypt.__clipboardToBuffer() : clipboard_data;

            /* Perform sanity checks on the clipboard data. */
            if ( !clipboard.mime_type.length || clipboard.data === null ) {
                callback( 'Invalid clipboard data.' );
                return;
            }

            /* Get a real file name, whether it be random or actual. */
            let file_name = clipboard.name.length === 0 ?
                require( 'crypto' ).pseudoRandomBytes( 16 ).toString( 'hex' ) :
                clipboard.name;

            /* Detect which extension this data type usually has only if the file doesn't have a name. */
            if( clipboard.name.length === 0 ) {
                let extension = require( 'mime-types' ).extension( clipboard.mime_type );

                /* Use the correct extension based on the mime-type only if valid. */
                if( extension && extension.length )
                    file_name += `.${extension}`;
            }

            /* Encrypt the buffer. */
            this.__up1EncryptBuffer(
                clipboard.data,
                clipboard.mime_type,
                file_name,
                sjcl,
                ( error_string, encrypted_data, identity, encoded_seed ) => {
                    /* Return if there's an error. */
                    if ( error_string !== null ) {
                        callback( error_string );
                        return;
                    }

                    /* Create a new FormData() object. */
                    let form = new ( require( 'form-data' ) )();

                    /* Append the ID and the file data to it. */
                    form.append( 'ident', identity );
                    form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                    /* Append the API key if necessary. */
                    if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                        form.append( 'api_key', up1_api_key );

                    /* Perform the post request. */
                    require( 'request' ).post(
                        {
                            headers: form.getHeaders(),
                            uri: `${up1_host}/up`,
                            body: form
                        },
                        ( err, res, body ) => {
                            try {
                                /* Execute the callback if no error has occurred. */
                                if ( err !== null )
                                    callback( err );
                                else {
                                    // noinspection JSUnresolvedVariable
                                    callback(
                                        null,
                                        `${up1_host}/#${encoded_seed}`,
                                        `/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                        encoded_seed
                                    );
                                }
                            }
                            catch ( ex ) {
                                callback( ex.toString() );
                            }
                        }
                    );
                }
            );
        }

        /**
         * @public
         * @desc Uploads the given file path to an Up1 service and returns the file URL and deletion key.
         * @param {string} file_path The path to the file to encrypt.
         * @param {string} up1_host The host URL for the Up1 service.
         * @param {string} [up1_api_key] The optional API key used for the service.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {UploadedFileCallback} callback The callback function called on success or failure.
         * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata.
         *      Default: False.
         */
        static __up1UploadFile( file_path, up1_host, up1_api_key, sjcl, callback, randomize_file_name = false ) {
            /* Encrypt the file data first. */
            this.__up1EncryptFile(
                file_path,
                sjcl,
                ( error_string, encrypted_data, identity, encoded_seed ) => {
                    /* Return if there's an error. */
                    if ( error_string !== null ) {
                        callback( error_string );
                        return;
                    }

                    /* Create a new FormData() object. */
                    let form = new ( require( 'form-data' ) )();

                    /* Append the ID and the file data to it. */
                    form.append( 'ident', identity );
                    form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                    /* Append the API key if necessary. */
                    if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                        form.append( 'api_key', up1_api_key );

                    /* Perform the post request. */
                    require( 'request' ).post(
                        {
                            headers: form.getHeaders(),
                            uri: `${up1_host}/up`,
                            body: form
                        },
                        ( err, res, body ) => {
                            try {
                                /* Execute the callback if no error has occurred. */
                                if ( err !== null )
                                    callback( err );
                                else {
                                    // noinspection JSUnresolvedVariable
                                    callback(
                                        null,
                                        `${up1_host}/#${encoded_seed}`,
                                        `/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                        encoded_seed
                                    );
                                }
                            }
                            catch ( ex ) {
                                callback( ex.toString() );
                            }
                        }
                    );
                },
                randomize_file_name
            );
        }

        /**
         * @private
         * @desc Downloads and decrypts a file uploaded with the Up1 spec.
         * @param {string|Buffer} seed The seed used to decrypt the file.
         * @param {string} up1_host The host URL for the Up1 service.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {function} callback Callback function to receive either the error string or the resulting object.
         * @return {Promise<any>}
         */
        static __up1DecryptDownload( seed, up1_host, sjcl, callback ) {
            /* First extract the ID of the file. */
            let id = sjcl.codec.base64url.fromBits( _discordCrypt.__up1SeedToKey( seed, sjcl ).ident );

            /* Retrieve the file asynchronously. */
            return _discordCrypt.__getRequest(
                `${up1_host}/i/${id}`,
                ( statusCode, errorString, result ) => {
                    /* Ensure no errors occurred. */
                    if( statusCode !== 200 || errorString !== 'OK' ) {
                        /* Build a simple HTTP error message and send it to the callback. */
                        callback( `${statusCode}: ${errorString}` );
                        return;
                    }

                    try {
                        /* Decrypt the buffer and send it to the callback function. */
                        callback( _discordCrypt.__up1DecryptBuffer( result, seed, sjcl ) );
                    }
                    catch( e ) {
                        /* Pass the exception string to the callback. */
                        callback( e.toString() );
                    }
                },
                null
            );
        }

        /**
         * @private
         * @desc Attempts to extract all Up1 links from a given message.
         * @param {string} input The input message.
         * @return {Array<string>} Returns an array of all Up1 URLs in the message.
         */
        static __up1ExtractValidUp1URLs( input ) {
            let result = [];

            /* Sanity check. */
            if( !input || !input.length )
                return result;

            /* Split up the input into chunks by spaces. */
            let parts = input.split( ' ' );

            /* Iterate each chunk. */
            for( let i = 0; i < parts.length; i++ ) {
                try {
                    /* Check if the chunk starts with the host prefix and the URL constructor can parse it. */
                    if( parts[ i ].indexOf( `${UP1_FILE_HOST}/#` ) !== -1 && ( new URL( parts[ i ] ) ) )
                        result.push( parts[ i ] );
                }
                catch( e ) {
                    /* Ignored. */
                }
            }

            /* Return the result. */
            return result;
        }

        /**
         * @private
         * @desc Attempts to parse an input changelog and returns only the differences between
         *      the current version and the latest version.
         * @param {string} changelog_data The full changelog data.
         * @param {string} current_version The current version currently installed.
         * @return {string} Returns the differences or the full changelog on failure.
         */
        static __tryParseChangelog( changelog_data, current_version ) {
            /**
             * @protected
             * @desc Compares two version numbers in the format x.y.z.
             * @param {string} first The first version string to compare.
             * @param {string} second The second version string to compare against.
             * @return {number} Returns 0 if equal, > 0 if [first > second] and < 0 if [second > first].
             */
            const VersionCompare = ( first, second ) => {
                /* Split the versions into segments. */
                let _first = first.replace( /(\.0+)+$/, '' ).split( '.' );
                let _second = second.replace( /(\.0+)+$/, '' ).split( '.' );

                /* Iterate over the smallest version component lengths. */
                for ( let i = 0; i < Math.min( _first.length, _second.length ); i++ ) {
                    /* Compare the first component to the second and check if it's larger. */
                    let delta = parseInt( _first[ i ], 10 ) - parseInt( _second[ i ], 10 );

                    /* Return a positive number indicating the length. */
                    if ( delta )
                        return delta;
                }

                /* Return either 0 or negative indicating the second is equal or greater than the first. */
                return _first.length - _second.length;
            };

            try {
                let result = '';

                /* Capture all versions and sort them from lowest to highest. */
                let versions = changelog_data
                    .split( "\r" )
                    .join( "" )
                    .match( /((Version )(\d+\.)(\d+\.)(\*|\d+))/gm )
                    .sort( VersionCompare );

                /* Iterate all versions from the most recent to the lowest. */
                for ( let i = versions.length - 1; i > 0; i-- ) {
                    /* Compare the current version against this one. */
                    let r = VersionCompare( current_version, versions[ i ] );

                    /* Ignore if the current version is greater or equal to the one being checked. */
                    if( r > 0 || r === 0 )
                        continue;

                    /* Get the full version changes block. */
                    let changes = changelog_data.slice(
                        changelog_data.indexOf( versions[ i ] ),
                        changelog_data.indexOf( versions[ i - 1 ] )
                    );

                    /* Insert the current version info into the changelog result. */
                    result += `${versions[ i ]}\n\n`;
                    result += changes
                        .replace( versions[ i ], '' )
                        .replace( "\n\n", '' );
                }

                /* Return the result. */
                return result;
            }
            catch ( e ) {
                _discordCrypt.log( `Failed to parse the changelog: ${e}`, 'warn' );
            }

            /* Return the full changelog. */
            return changelog_data;
        }

        /**
         * @private
         * @desc Generates a passphrase using the Diceware word list modified by ETF.
         * @see https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases
         * @param {number} word_length The number of words to generate.
         * @return {{passphrase: string, entropy: number}} Returns the passphrase and approximate entropy in bits.
         */
        static __generateDicewarePassphrase( word_length ) {
            const MAX_VALUE = 7775,
                ENTROPY_PER_WORD = Math.log2( MAX_VALUE ),
                crypto = require( 'crypto' ),
                WORDLIST = _discordCrypt.__zlibDecompress( DICEWARE_WORD_LIST ).split( '\r' ).join( '' ).split( '\n' );

            let passphrase = '';

            /* Generate each word. */
            for( let i = 0; i < word_length; i++ )
                passphrase += `${WORDLIST[ parseInt( crypto.randomBytes( 4 ).toString( 'hex' ), 16 ) % MAX_VALUE ]} `;

            /* Return the result. */
            return {
                passphrase: passphrase.trim(),
                entropy: ENTROPY_PER_WORD * word_length
            }
        }

        /* ========================================================= */

        /* =================== CRYPTO PRIMITIVES =================== */

        /**
         * @public
         * @desc Pads or un-pads the input message using the specified encoding format and block size.
         * @param {string|Buffer|Array} message The input message to either pad or unpad.
         * @param {string} padding_scheme The padding scheme used. This can be either: [ ISO1, ISO9, PKC7, ANS2 ]
         * @param {int} block_size The block size that the padding scheme must align the message to.
         * @param {boolean} [is_hex] Whether to treat the message as a hex or Base64 string.
         *      If undefined, it is interpreted as a UTF-8 string.
         * @param {boolean} [remove_padding] Whether to remove the padding applied to the message. If undefined, it is
         *      treated as false.
         * @returns {Buffer} Returns the padded or unpadded message as a Buffer object.
         */
        static __padMessage( message, padding_scheme, block_size, is_hex = undefined, remove_padding = undefined ) {
            let _message, _padBytes;

            /* Returns the number of bytes required to pad a message based on the block size. */
            function __getPaddingLength( totalLength, blockSize ) {
                return totalLength % blockSize === blockSize ? blockSize : blockSize - ( totalLength % blockSize );
            }

            /* Pads a message according to the PKCS #7 / PKCS #5 format. */
            function __PKCS7( message, paddingBytes, remove ) {
                if ( remove === undefined ) {
                    /* Allocate required padding length + message length. */
                    let padded = Buffer.alloc( message.length + paddingBytes );

                    /* Copy the message. */
                    message.copy( padded );

                    /* Append the number of padding bytes according to PKCS #7 / PKCS #5 format. */
                    Buffer.alloc( paddingBytes ).fill( paddingBytes ).copy( padded, message.length );

                    /* Return the result. */
                    return padded;
                }
                else {
                    /* Remove the padding indicated by the last byte. */
                    return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
                }
            }

            /* Pads a message according to the ANSI X9.23 format. */
            function __ANSIX923( message, paddingBytes, remove ) {
                if ( remove === undefined ) {
                    /* Allocate required padding length + message length. */
                    let padded = Buffer.alloc( message.length + paddingBytes );

                    /* Copy the message. */
                    message.copy( padded );

                    /* Append null-bytes till the end of the message. */
                    Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( padded, message.length );

                    /* Append the padding length as the final byte of the message. */
                    Buffer.alloc( 1 ).fill( paddingBytes ).copy( padded, message.length + paddingBytes - 1 );

                    /* Return the result. */
                    return padded;
                }
                else {
                    /* Remove the padding indicated by the last byte. */
                    return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
                }
            }

            /* Pads a message according to the ISO 10126 format. */
            function __ISO10126( message, paddingBytes, remove ) {
                const crypto = require( 'crypto' );

                if ( remove === undefined ) {
                    /* Allocate required padding length + message length. */
                    let padded = Buffer.alloc( message.length + paddingBytes );

                    /* Copy the message. */
                    message.copy( padded );

                    /* Copy random data to the end of the message. */
                    crypto.randomBytes( paddingBytes - 1 ).copy( padded, message.length );

                    /* Write the padding length at the last byte. */
                    padded.writeUInt8( paddingBytes, message.length + paddingBytes - 1 );

                    /* Return the result. */
                    return padded;
                }
                else {
                    /* Remove the padding indicated by the last byte. */
                    return message.slice( 0, message.length - message.readUInt8( message.length - 1 ) );
                }
            }

            /* Pads a message according to the ISO 97971 format. */
            function __ISO97971( message, paddingBytes, remove ) {
                if ( remove === undefined ) {
                    /* Allocate required padding length + message length. */
                    let padded = Buffer.alloc( message.length + paddingBytes );

                    /* Copy the message. */
                    message.copy( padded );

                    /* Append the first byte as 0x80 */
                    Buffer.alloc( 1 ).fill( 0x80 ).copy( padded, message.length );

                    /* Fill the rest of the padding with zeros. */
                    Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( message, message.length + 1 );

                    /* Return the result. */
                    return padded;
                }
                else {

                    /* Scan backwards. */
                    let lastIndex = message.length - 1;

                    /* Find the amount of null padding bytes. */
                    for ( ; lastIndex > 0; lastIndex-- )
                        /* If a null byte is encountered, split at this index. */
                        if ( message[ lastIndex ] !== 0x00 )
                            break;

                    /* Remove the null-padding. */
                    let cleaned = message.slice( 0, lastIndex + 1 );

                    /* Remove the final byte which is 0x80. */
                    return cleaned.slice( 0, cleaned.length - 1 );
                }
            }

            /* Convert the message to a Buffer object. */
            _message = _discordCrypt.__toBuffer( message, is_hex );

            /* Get the number of bytes required to pad this message. */
            _padBytes = remove_padding ? 0 : __getPaddingLength( _message.length, block_size / 8 );

            /* Apply the message padding based on the format specified. */
            switch ( padding_scheme.toUpperCase() ) {
            case 'PKC7':
                return __PKCS7( _message, _padBytes, remove_padding );
            case 'ANS2':
                return __ANSIX923( _message, _padBytes, remove_padding );
            case 'ISO1':
                return __ISO10126( _message, _padBytes, remove_padding );
            case 'ISO9':
                return __ISO97971( _message, _padBytes, remove_padding );
            default:
                return '';
            }
        }

        /**
         * @public
         * @desc Determines whether the passed cipher name is valid.
         * @param {string} cipher The name of the cipher to check.
         * @returns {boolean} Returns true if the cipher name is valid.
         * @example
         * console.log( __isValidCipher( 'aes-256-cbc' ) ); // True
         * @example
         * console.log( __isValidCipher( 'aes-256-gcm' ) ); // True
         * @example
         * console.log( __isValidCipher( 'camellia-256-gcm' ) ); // False
         */
        static __isValidCipher( cipher ) {
            const crypto = require( 'crypto' );
            let isValid = false;

            /* Iterate all valid Crypto ciphers and compare the name. */
            let cipher_name = cipher.toLowerCase();
            crypto.getCiphers().every( ( s ) => {
                /* If the cipher matches, stop iterating. */
                if ( s === cipher_name ) {
                    isValid = true;
                    return false;
                }

                /* Continue iterating. */
                return true;
            } );

            /* Return the result. */
            return isValid;
        }

        /**
         * @public
         * @desc Converts a given key or iv into a buffer object. Performs a hash of the key it doesn't match the
         *      blockSize.
         * @param {string|Buffer|Array} key The key to perform validation on.
         * @param {int} key_size_bits The bit length of the desired key.
         * @returns {Buffer} Returns a Buffer() object containing the key of the desired length.
         */
        static __validateKeyIV( key, key_size_bits = 256 ) {
            /* Get the designed hashing algorithm. */
            let keyBytes = key_size_bits / 8;

            /* If the length of the key isn't of the desired size, hash it. */
            if ( key.length !== keyBytes ) {
                let hash;
                /* Get the appropriate hash algorithm for the key size. */
                switch ( keyBytes ) {
                case 8:
                case 16:
                case 20:
                case 24:
                case 32:
                    // noinspection JSUnresolvedFunction
                    hash = global.sha3.sha3_512( key ).slice( 0, keyBytes * 2 );
                    break;
                case 64:
                    // noinspection JSUnresolvedFunction
                    hash = global.sha3.sha3_512( key );
                    break;
                default:
                    throw 'Invalid block size specified for key or iv. Only 64, 128, 160, 192, 256 and 512 bit keys' +
                    ' are supported.';
                }
                /* Hash the key and return it as a buffer. */
                return Buffer.from( hash, 'hex' );
            }
            else
                return Buffer.from( key );
        }

        /**
         * @public
         * @desc Convert the message to a buffer object.
         * @param {string|Buffer|Array} message The input message.
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {Buffer} Returns a Buffer() object containing the message.
         * @throws An exception indicating the input message type is neither an Array(), Buffer() or string.
         */
        static __validateMessage( message, is_message_hex = undefined ) {
            /* Convert the message to a buffer. */
            try {
                return _discordCrypt.__toBuffer( message, is_message_hex );
            }
            catch ( e ) {
                throw 'exception - Invalid message type.';
            }
        }

        /**
         * @public
         * @desc Converts a cipher string to its appropriate index number.
         * @param {string} primary_cipher The primary cipher.
         *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
         * @param {string} [secondary_cipher] The secondary cipher.
         *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
         * @returns {int} Returns the index value of the algorithm.
         */
        static __cipherStringToIndex( primary_cipher, secondary_cipher = undefined ) {
            let value = 0;

            /* Return if already a number. */
            if ( typeof primary_cipher === 'number' )
                return primary_cipher;

            /* Check if it's a joined string. */
            if ( typeof primary_cipher === 'string' && primary_cipher.search( '-' ) !== -1 &&
                secondary_cipher === undefined ) {
                primary_cipher = primary_cipher.split( '-' )[ 0 ];
                secondary_cipher = primary_cipher.split( '-' )[ 1 ];
            }

            /* Resolve the primary index. */
            switch ( primary_cipher ) {
            case 'bf':
                /* value = 0; */
                break;
            case 'aes':
                value = 1;
                break;
            case 'camel':
                value = 2;
                break;
            case 'idea':
                value = 3;
                break;
            case 'tdes':
                value = 4;
                break;
            default:
                return 0;
            }

            /* Make sure the secondary is valid. */
            if ( secondary_cipher !== undefined ) {
                switch ( secondary_cipher ) {
                case 'bf':
                    /* value = 0; */
                    break;
                case 'aes':
                    value += 5;
                    break;
                case 'camel':
                    value += 10;
                    break;
                case 'idea':
                    value += 15;
                    break;
                case 'tdes':
                    value += 20;
                    break;
                default:
                    break;
                }
            }

            /* Return the index. */
            return value;
        }

        /**
         * @public
         * @desc Converts an algorithm index to its appropriate string value.
         * @param {int} index The index of the cipher(s) used.
         * @param {boolean} get_secondary Whether to retrieve the secondary algorithm name.
         * @returns {string} Returns a shorthand representation of either the primary or secondary cipher.
         *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
         */
        static __cipherIndexToString( index, get_secondary = undefined ) {

            /* Strip off the secondary. */
            if ( get_secondary !== undefined && get_secondary ) {
                if ( index >= 20 )
                    return 'tdes';
                else if ( index >= 15 )
                    return 'idea';
                else if ( index >= 10 )
                    return 'camel';
                else if ( index >= 5 )
                    return 'aes';
                else
                    return 'bf';
            }
            /* Remove the secondary. */
            else if ( index >= 20 )
                index -= 20;
            else if ( index >= 15 && index <= 19 )
                index -= 15;
            else if ( index >= 10 && index <= 14 )
                index -= 10;
            else if ( index >= 5 && index <= 9 )
                index -= 5;

            /* Calculate the primary. */
            if ( index === 1 )
                return 'aes';
            else if ( index === 2 )
                return 'camel';
            else if ( index === 3 )
                return 'idea';
            else if ( index === 4 )
                return 'tdes';
            else
                return 'bf';
        }

        /**
         * @public
         * @desc Converts an input string to the approximate entropic bits using Shannon's algorithm.
         * @param {string} key The input key to check.
         * @returns {int} Returns the approximate number of bits of entropy contained in the key.
         */
        static __entropicBitLength( key ) {
            let h = Object.create( null ), k;
            let sum = 0, len = key.length;

            key.split( '' ).forEach( c => {
                h[ c ] ? h[ c ]++ : h[ c ] = 1;
            } );

            for ( k in h ) {
                let p = h[ k ] / len;
                sum -= p * Math.log2( p );
            }

            return parseInt( sum * len );
        }

        /**
         * @public
         * @desc Returns 256-characters of Braille.
         * @return {string}
         */
        static __getBraille() {
            return Array.from(
                "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖" +
                "⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭" +
                "⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿"
            );
        }

        /**
         * @public
         * @desc Returns an array of valid Diffie-Hellman exchange key bit-sizes.
         * @returns {number[]} Returns the bit lengths of all supported DH keys.
         */
        static __getDHBitSizes() {
            return [ 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192 ];
        }

        /**
         * @public
         * @desc Returns an array of Elliptic-Curve Diffie-Hellman key bit-sizes.
         * @returns {number[]} Returns the bit lengths of all supported ECDH keys.
         */
        static __getECDHBitSizes() {
            return [ 224, 256, 384, 409, 521, 571 ];
        }

        /**
         * @public
         * @desc Determines if a key exchange algorithm's index is valid.
         * @param {int} index The index to determine if valid.
         * @returns {boolean} Returns true if the desired index meets one of the ECDH or DH key sizes.
         */
        static __isValidExchangeAlgorithm( index ) {
            return index >= 0 &&
                index <= ( _discordCrypt.__getDHBitSizes().length + _discordCrypt.__getECDHBitSizes().length - 1 );
        }

        /**
         * @public
         * @desc Converts an algorithm index to a string.
         * @param {int} index The input index of the exchange algorithm.
         * @returns {string} Returns a string containing the algorithm or "Invalid Algorithm".
         */
        static __indexToExchangeAlgorithmString( index ) {
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();
            let base = [ 'DH-', 'ECDH-' ];

            if ( !_discordCrypt.__isValidExchangeAlgorithm( index ) )
                return 'Invalid Algorithm';

            return ( index <= ( dh_bl.length - 1 ) ?
                base[ 0 ] + dh_bl[ index ] :
                base[ 1 ] + ecdh_bl[ index - dh_bl.length ] );
        }

        /**
         * @public
         * @desc Converts an algorithm index to a bit size.
         * @param {int} index The index to convert to the bit length.
         * @returns {int} Returns 0 if the index is invalid or the bit length of the index.
         */
        static __indexToAlgorithmBitLength( index ) {
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();

            if ( !_discordCrypt.__isValidExchangeAlgorithm( index ) )
                return 0;

            return ( index <= ( dh_bl.length - 1 ) ? dh_bl[ index ] : ecdh_bl[ index - dh_bl.length ] );
        }

        /**
         * @public
         * @desc Computes a secret key from two ECDH or DH keys. One private and one public.
         * @param {Object} private_key A private key DH or ECDH object from NodeJS's crypto module.
         * @param {string} public_key The public key as a string in Base64 or hex format.
         * @param {boolean} is_base_64 Whether the public key is a Base64 string. If false, it is assumed to be hex.
         * @param {boolean} to_base_64 Whether to convert the output secret to Base64.
         *      If false, it is converted to hex.
         * @returns {string|null} Returns a string encoded secret on success or null on failure.
         */
        static __computeExchangeSharedSecret( private_key, public_key, is_base_64, to_base_64 ) {
            let in_form, out_form;

            /* Compute the formats. */
            in_form = is_base_64 ? 'base64' : 'hex';
            out_form = to_base_64 ? 'base64' : 'hex';

            /* Compute the derived key and return. */
            try {
                return private_key.computeSecret( public_key, in_form, out_form );
            }
            catch ( e ) {
                return null;
            }
        }

        /**
         * @public
         * @desc Generates a Diffie-Hellman key pair.
         * @param {int} size The bit length of the desired key pair.
         *      This must be one of the supported lengths retrieved from __getDHBitSizes().
         * @param {Buffer} private_key The optional private key used to initialize the object.
         * @returns {Object|null} Returns a DiffieHellman object on success or null on failure.
         */
        static __generateDH( size, private_key = undefined ) {
            let groupName, key;

            /* Calculate the appropriate group. */
            switch ( size ) {
            case 768:
                groupName = 'modp1';
                break;
            case 1024:
                groupName = 'modp2';
                break;
            case 1536:
                groupName = 'modp5';
                break;
            case 2048:
                groupName = 'modp14';
                break;
            case 3072:
                groupName = 'modp15';
                break;
            case 4096:
                groupName = 'modp16';
                break;
            case 6144:
                groupName = 'modp17';
                break;
            case 8192:
                groupName = 'modp18';
                break;
            default:
                return null;
            }

            /* Create the key object. */
            try {
                key = require( 'crypto' ).getDiffieHellman( groupName );
            }
            catch ( err ) {
                return null;
            }

            /* Generate the key if it's valid. */
            if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' ) {
                if ( private_key === undefined )
                    key.generateKeys();
                else if ( typeof key.setPrivateKey !== 'undefined' )
                    key.setPrivateKey( private_key );
            }

            /* Return the result. */
            return key;
        }

        /**
         * @public
         * @see http://www.secg.org/sec2-v2.pdf
         * @desc Generates a Elliptic-Curve Diffie-Hellman key pair.
         * @param {int} size The bit length of the desired key pair.
         *      This must be one of the supported lengths retrieved from __getECDHBitSizes().
         * @param {Buffer} private_key The optional private key used to initialize the object.
         * @returns {Object|null} Returns a ECDH object on success or null on failure.
         */
        static __generateECDH( size, private_key = undefined ) {
            let groupName, key;

            /* Calculate the appropriate group. */
            switch ( size ) {
            case 224:
                groupName = 'secp224k1';
                break;
            case 384:
                groupName = 'secp384r1';
                break;
            case 409:
                groupName = 'sect409k1';
                break;
            case 521:
                groupName = 'secp521r1';
                break;
            case 571:
                groupName = 'sect571k1';
                break;
            case 256:
                break;
            default:
                return null;
            }

            /* Create the key object. */
            try {
                if ( size !== 256 )
                    key = require( 'crypto' ).createECDH( groupName );
                else {
                    key = new global.Curve25519();
                    key.generateKeys( undefined, require( 'crypto' ).randomBytes( 32 ) );
                }
            }
            catch ( err ) {
                return null;
            }

            /* Generate the key if it's valid. */
            if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' && size !== 256 ) {
                /* Generate a new key if the private key is undefined else set the private key. */
                if ( private_key === undefined )
                    key.generateKeys( 'hex', 'compressed' );
                else if ( typeof key.setPrivateKey !== 'undefined' )
                    key.setPrivateKey( private_key );
            }

            /* Return the result. */
            return key;
        }

        /**
         * @public
         * @desc Substitutes an input Buffer() object to the Braille equivalent from __getBraille().
         * @param {string} message The input message to perform substitution on.
         * @param {boolean} convert Whether the message is to be converted from hex to Braille or from Braille to hex.
         * @returns {string} Returns the substituted string encoded message.
         * @throws An exception indicating the message contains characters not in the character set.
         */
        static __substituteMessage( message, convert ) {
            /* Target character set. */
            let subset = _discordCrypt.__getBraille();

            let result = "", index = 0;

            if ( convert !== undefined ) {
                /* Sanity check. */
                if ( !Buffer.isBuffer( message ) )
                    throw 'Message input is not a buffer.';

                /* Calculate the target character. */
                for ( let i = 0; i < message.length; i++ )
                    result += subset[ message[ i ] ];
            }
            else {
                /* Calculate the target character. */
                for ( let i = 0; i < message.length; i++ ) {
                    index = subset.indexOf( message[ i ] );

                    /* Sanity check. */
                    if ( index === -1 )
                        throw 'Message contains invalid characters.';

                    result += `0${index.toString( 16 )}`.slice( -2 );
                }
            }

            return result;
        }

        /**
         * @public
         * @desc Encodes the given values as a braille encoded 32-bit word.
         * @param {int} cipher_index The index of the cipher(s) used to encrypt the message
         * @param {int} cipher_mode_index The index of the cipher block mode used for the message.
         * @param {int} padding_scheme_index The index of the padding scheme for the message.
         * @param {int} pad_byte The padding byte to use.
         * @returns {string} Returns a substituted UTF-16 string of a braille encoded 32-bit word containing these
         *      options.
         */
        static __metaDataEncode( cipher_index, cipher_mode_index, padding_scheme_index, pad_byte ) {

            /* Parse the first 8 bits. */
            if ( typeof cipher_index === 'string' )
                cipher_index = _discordCrypt.__cipherStringToIndex( cipher_index );

            /* Parse the next 8 bits. */
            if ( typeof cipher_mode_index === 'string' )
                // noinspection JSUnresolvedFunction
                cipher_mode_index = [ 'cbc', 'cfb', 'ofb' ].indexOf( cipher_mode_index.toLowerCase() );

            /* Parse the next 8 bits. */
            if ( typeof padding_scheme_index === 'string' )
                // noinspection JSUnresolvedFunction
                padding_scheme_index = [ 'pkc7', 'ans2', 'iso1', 'iso9' ].indexOf( padding_scheme_index.toLowerCase() );

            /* Buffered word. */
            let buf = Buffer.from( [ cipher_index, cipher_mode_index, padding_scheme_index, parseInt( pad_byte ) ] );

            /* Convert it and return. */
            return _discordCrypt.__substituteMessage( buf, true );
        }

        /**
         * @public
         * @desc Decodes an input string and returns a byte array containing index number of options.
         * @param {string} message The substituted UTF-16 encoded metadata containing the metadata options.
         * @returns {int[]} Returns 4 integer indexes of each metadata value.
         */
        static __metaDataDecode( message ) {
            /* Decode the result and convert the hex to a Buffer. */
            return Buffer.from( _discordCrypt.__substituteMessage( message ), 'hex' );
        }

        /**
         * @public
         * @desc Encrypts the given plain-text message using the algorithm specified.
         * @param {string} symmetric_cipher The name of the symmetric cipher used to encrypt the message.
         *      This must be supported by NodeJS's crypto module.
         * @param {string} block_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_scheme The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {boolean} convert_to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
         * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer|null} Returns a Buffer() object containing the ciphertext or null if the chosen options are
         *      invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __encrypt(
            symmetric_cipher,
            block_mode,
            padding_scheme,
            message,
            key,
            convert_to_hex,
            is_message_hex,
            key_size_bits = 256,
            block_cipher_size = 128,
            one_time_salt
        ) {
            const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
            const crypto = require( 'crypto' );

            /* Buffered parameters. */
            let _message, _key, _iv, _salt, _derived, _encrypt;

            /* Make sure the cipher name and mode is valid first. */
            if (
                !_discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'cfb', 'ofb' ]
                    .indexOf( block_mode.toLowerCase() ) === -1
            )
                return null;

            /* Pad the message to the nearest block boundary. */
            _message = _discordCrypt.__padMessage( message, padding_scheme, key_size_bits, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Check if using a predefined salt. */
            if ( one_time_salt !== undefined ) {
                /* Convert the salt to a Buffer. */
                _salt = _discordCrypt.__toBuffer( one_time_salt );

                /* Don't bother continuing if conversions have failed. */
                if ( !_salt || _salt.length === 0 )
                    return null;

                /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
                if ( _salt.length !== 8 )
                    // noinspection JSUnresolvedFunction
                    _salt = Buffer.from(
                        global.sha3.sha3_256( _salt ).slice( 0, 16 ),
                        'hex'
                    );
            }
            else {
                /* Generate a random salt to derive the key and IV. */
                _salt = crypto.randomBytes( 8 );
            }

            /* Derive the key length and IV length. */
            // noinspection JSUnresolvedFunction
            _derived = Buffer.from(
                global.sha3.kmac_256(
                    _key,
                    _salt,
                    block_cipher_size + key_size_bits,
                    ENCRYPT_PARAMETER
                ),
                'hex'
            );

            /* Slice off the IV. */
            _iv = _derived.slice( 0, block_cipher_size / 8 );

            /* Slice off the key. */
            _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

            /* Create the cipher with derived IV and key. */
            _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

            /* Disable automatic PKCS #7 padding. We do this in-house. */
            _encrypt.setAutoPadding( false );

            /* Get the cipher text. */
            let _ct = _encrypt.update( _message, undefined, 'hex' );
            _ct += _encrypt.final( 'hex' );

            /* Return the result with the prepended salt. */
            return Buffer.from( _salt.toString( 'hex' ) + _ct, 'hex' ).toString( convert_to_hex ? 'hex' : 'base64' );
        }

        /**
         * @public
         * @desc Decrypts the given cipher-text message using the algorithm specified.
         * @param {string} symmetric_cipher The name of the symmetric cipher used to decrypt the message.
         *      This must be supported by NodeJS's crypto module.
         * @param {string} block_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_scheme The padding scheme used to unpad the message from the block length of the
         *      cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string|Buffer|Array} message The input ciphertext message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {boolean} output_format The output format of the plaintext.
         *      Can be either [ 'utf8', 'latin1', 'hex', 'base64' ]
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
         * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         * options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __decrypt(
            symmetric_cipher,
            block_mode,
            padding_scheme,
            message,
            key,
            output_format,
            is_message_hex,
            key_size_bits = 256,
            block_cipher_size = 128
        ) {
            const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
            const crypto = require( 'crypto' );

            /* Buffered parameters. */
            let _message, _key, _iv, _salt, _derived, _decrypt;

            /* Make sure the cipher name and mode is valid first. */
            if ( !_discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'ofb', 'cfb' ]
                .indexOf( block_mode.toLowerCase() ) === -1 )
                return null;

            /* Get the message as a buffer. */
            _message = _discordCrypt.__validateMessage( message, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Retrieve the 64-bit salt. */
            _salt = _message.slice( 0, 8 );

            /* Derive the key length and IV length. */
            // noinspection JSUnresolvedFunction
            _derived = Buffer.from(
                global.sha3.kmac_256(
                    _key,
                    _salt,
                    block_cipher_size + key_size_bits,
                    ENCRYPT_PARAMETER
                ),
                'hex'
            );

            /* Slice off the IV. */
            _iv = _derived.slice( 0, block_cipher_size / 8 );

            /* Slice off the key. */
            _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

            /* Splice the message. */
            _message = _message.slice( 8 );

            /* Create the cipher with IV. */
            _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

            /* Disable automatic PKCS #7 padding. We do this in-house. */
            _decrypt.setAutoPadding( false );

            /* Decrypt the cipher text. */
            let _pt = _decrypt.update( _message, undefined, 'hex' );
            _pt += _decrypt.final( 'hex' );

            /* Unpad the message. */
            _pt = _discordCrypt.__padMessage( _pt, padding_scheme, key_size_bits, true, true );

            /* Return the buffer. */
            return _pt.toString( output_format );
        }

        /**
         * @public
         * @desc Dual-encrypts a message using symmetric keys and returns the substituted encoded equivalent.
         * @param {string|Buffer} message The input message to encrypt.
         * @param {Buffer} primary_key The primary key used for the first level of encryption.
         * @param {Buffer} secondary_key The secondary key used for the second level of encryption.
         * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for encryption.
         * @param {string} block_mode The block operation mode of the ciphers.
         *      These can be: [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
         * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
         * @throws An exception indicating the error that occurred.
         */
        static __symmetricEncrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
            const customizationParameter = new Uint8Array( Buffer.from( 'discordCrypt MAC' ) );

            /* Performs one of the 5 standard encryption algorithms on the plain text. */
            function handleEncodeSegment( message, key, cipher, mode, pad ) {
                switch ( cipher ) {
                case 0:
                    return _discordCrypt.__blowfish512_encrypt( message, key, mode, pad );
                case 1:
                    return _discordCrypt.__aes256_encrypt( message, key, mode, pad );
                case 2:
                    return _discordCrypt.__camellia256_encrypt( message, key, mode, pad );
                case 3:
                    return _discordCrypt.__idea128_encrypt( message, key, mode, pad );
                case 4:
                    return _discordCrypt.__tripledes192_encrypt( message, key, mode, pad );
                default:
                    return null;
                }
            }

            /* Convert the block mode. */
            let mode = block_mode.toLowerCase();

            /* Convert the padding. */
            let pad = padding_mode;

            /* Encode using the user-specified symmetric algorithm. */
            let msg = '';

            /* Dual-encrypt the segment. */
            if ( cipher_index >= 0 && cipher_index <= 4 )
                msg = _discordCrypt.__blowfish512_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 5 && cipher_index <= 9 )
                msg = _discordCrypt.__aes256_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 5, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 10 && cipher_index <= 14 )
                msg = _discordCrypt.__camellia256_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 10, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 15 && cipher_index <= 19 )
                msg = _discordCrypt.__idea128_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 15, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 20 && cipher_index <= 24 )
                msg = _discordCrypt.__tripledes192_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 20, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else
                throw `Unknown cipher selected: ${cipher_index}`;

            /* Get MAC tag as a hex string. */
            // noinspection JSUnresolvedFunction
            let tag = global.sha3.kmac256(
                new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
                new Uint8Array( Buffer.from( msg, 'hex' ) ),
                256,
                customizationParameter
            );

            /* Prepend the authentication tag hex string & convert it to Base64. */
            msg = Buffer.from( tag + msg, 'hex' );

            /* Return the message. */
            return _discordCrypt.__substituteMessage( msg, true );
        }

        /**
         * @public
         * @desc Dual-decrypts a message using symmetric keys and returns the substituted encoded equivalent.
         * @param {string|Buffer|Array} message The substituted and encoded input message to decrypt.
         * @param {Buffer} primary_key The primary key used for the **second** level of decryption.
         * @param {Buffer} secondary_key The secondary key used for the **first** level of decryption.
         * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for decryption.
         * @param {string} block_mode The block operation mode of the ciphers.
         *      These can be: [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to unpad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         *      If this is enabled and authentication fails, null is returned.
         *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
         * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
         * @throws An exception indicating the error that occurred.
         */
        static __symmetricDecrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
            const customizationParameter = new Uint8Array( Buffer.from( 'discordCrypt MAC' ) );
            const crypto = require( 'crypto' );

            /* Performs one of the 5 standard decryption algorithms on the plain text. */
            function handleDecodeSegment(
                message,
                key,
                cipher,
                mode,
                pad,
                output_format = 'utf8',
                is_message_hex = undefined
            ) {
                switch ( cipher ) {
                case 0:
                    return _discordCrypt.__blowfish512_decrypt(
                        message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
                case 1:
                    return _discordCrypt.__aes256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 2:
                    return _discordCrypt.__camellia256_decrypt(
                        message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
                case 3:
                    return _discordCrypt.__idea128_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 4:
                    return _discordCrypt.__tripledes192_decrypt( message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
                default:
                    return null;
                }
            }

            let mode, pad;

            /* Convert the block mode. */
            if ( typeof block_mode !== 'string' ) {
                if ( block_mode === 0 )
                    mode = 'cbc';
                else if ( block_mode === 1 )
                    mode = 'cfb';
                else if ( block_mode === 2 )
                    mode = 'ofb';
                else return '';
            }

            /* Convert the padding. */
            if ( typeof padding_mode !== 'string' ) {
                if ( padding_mode === 0 )
                    pad = 'pkc7';
                else if ( padding_mode === 1 )
                    pad = 'ans2';
                else if ( padding_mode === 2 )
                    pad = 'iso1';
                else if ( padding_mode === 3 )
                    pad = 'iso9';
                else return '';
            }

            try {
                /* Decode level-1 message to a buffer. */
                message = Buffer.from( _discordCrypt.__substituteMessage( message ), 'hex' );

                /* Pull off the first 32 bytes as a buffer. */
                // noinspection JSUnresolvedFunction
                let tag = Buffer.from( message.subarray( 0, 32 ) );

                /* Strip off the authentication tag. */
                // noinspection JSUnresolvedFunction
                message = Buffer.from( message.subarray( 32 ) );

                /* Compute the HMAC-SHA3-256 of the cipher text as hex. */
                // noinspection JSUnresolvedFunction
                let computed_tag = Buffer.from(
                    global.sha3.kmac256(
                        new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
                        new Uint8Array( message ),
                        256,
                        customizationParameter
                    ),
                    'hex'
                );

                /* Compare the tag for validity. */
                if ( !crypto.timingSafeEqual( computed_tag, tag ) )
                    return 1;

                /* Dual decrypt the segment. */
                if ( cipher_index >= 0 && cipher_index <= 4 )
                    return handleDecodeSegment(
                        _discordCrypt.__blowfish512_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 5 && cipher_index <= 9 )
                    return handleDecodeSegment(
                        _discordCrypt.__aes256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 5,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 10 && cipher_index <= 14 )
                    return handleDecodeSegment(
                        _discordCrypt.__camellia256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 10,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 15 && cipher_index <= 19 )
                    return handleDecodeSegment(
                        _discordCrypt.__idea128_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 15,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 20 && cipher_index <= 24 )
                    return handleDecodeSegment(
                        _discordCrypt.__tripledes192_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 20,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                return -3;
            }
            catch ( e ) {
                return 2;
            }
        }

        /**
         * @public
         * @desc Blowfish encrypts a message.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __blowfish512_encrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            one_time_salt = undefined
        ) {
            /* Size constants for Blowfish. */
            const keySize = 512, blockSize = 64;

            /* Perform the encryption. */
            return _discordCrypt.__encrypt(
                'bf',
                cipher_mode,
                padding_mode,
                message,
                key,
                to_hex,
                is_message_hex,
                keySize,
                blockSize,
                one_time_salt
            );
        }

        /**
         * @public
         * @desc Blowfish decrypts a message.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __blowfish512_decrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            /* Size constants for Blowfish. */
            const keySize = 512, blockSize = 64;

            /* Return the unpadded message. */
            return _discordCrypt.__decrypt(
                'bf',
                cipher_mode,
                padding_mode,
                message,
                key,
                output_format,
                is_message_hex,
                keySize,
                blockSize
            );
        }

        /**
         * @public
         * @desc AES-256 encrypts a message.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __aes256_encrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            one_time_salt = undefined
        ) {
            /* Size constants for AES-256. */
            const keySize = 256, blockSize = 128;

            /* Perform the encryption. */
            return _discordCrypt.__encrypt(
                'aes-256',
                cipher_mode,
                padding_mode,
                message,
                key,
                to_hex,
                is_message_hex,
                keySize,
                blockSize,
                one_time_salt
            );
        }

        /**
         * @public
         * @desc AES-256 decrypts a message.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __aes256_decrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            /* Size constants for AES-256. */
            const keySize = 256, blockSize = 128;

            /* Return the unpadded message. */
            return _discordCrypt.__decrypt(
                'aes-256',
                cipher_mode,
                padding_mode,
                message,
                key,
                output_format,
                is_message_hex,
                keySize,
                blockSize
            );
        }

        /*  */
        /**
         * @public
         * @desc AES-256 decrypts a message in GCM mode.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
         *      authentication.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __aes256_encrypt_gcm(
            message,
            key,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            additional_data = undefined,
            one_time_salt = undefined
        ) {
            const block_cipher_size = 128, key_size_bits = 256;
            const cipher_name = 'aes-256-gcm';
            const crypto = require( 'crypto' );

            let _message, _key, _iv, _salt, _derived, _encrypt;

            /* Pad the message to the nearest block boundary. */
            _message = _discordCrypt.__padMessage( message, padding_mode, key_size_bits, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Check if using a predefined salt. */
            if ( one_time_salt !== undefined ) {
                /* Convert the salt to a Buffer. */
                _salt = _discordCrypt.__toBuffer( one_time_salt );

                /* Don't bother continuing if conversions have failed. */
                if ( !_salt || _salt.length === 0 )
                    return null;

                /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
                if ( _salt.length !== 8 )
                    // noinspection JSUnresolvedFunction
                    _salt = Buffer.from(
                        global.sha3.sha3_256( _salt ).slice( 0, 16 ),
                        'hex'
                    );
            }
            else {
                /* Generate a random salt to derive the key and IV. */
                _salt = crypto.randomBytes( 8 );
            }

            /* Derive the key length and IV length. */
            // noinspection JSUnresolvedFunction
            _derived = Buffer.from(
                global.sha3.kmac_256(
                    _key,
                    _salt,
                    block_cipher_size + key_size_bits,
                    ENCRYPT_PARAMETER
                ),
                'hex'
            );

            /* Slice off the IV. */
            _iv = _derived.slice( 0, block_cipher_size / 8 );

            /* Slice off the key. */
            _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

            /* Create the cipher with derived IV and key. */
            _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

            /* Add the additional data if necessary. */
            if ( additional_data !== undefined )
                _encrypt.setAAD( _discordCrypt.__toBuffer( additional_data ) );

            /* Disable automatic PKCS #7 padding. We do this in-house. */
            _encrypt.setAutoPadding( false );

            /* Get the cipher text. */
            let _ct = _encrypt.update( _message, undefined, 'hex' );
            _ct += _encrypt.final( 'hex' );

            /* Return the auth tag prepended with the salt to the message. */
            return Buffer.from(
                _encrypt.getAuthTag().toString( 'hex' ) + _salt.toString( 'hex' ) + _ct,
                'hex'
            ).toString( to_hex ? 'hex' : 'base64' );
        }

        /**
         * @public
         * @desc AES-256 decrypts a message in GCM mode.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
         *      authentication.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __aes256_decrypt_gcm(
            message,
            key,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined,
            additional_data = undefined
        ) {
            const block_cipher_size = 128, key_size_bits = 256;
            const cipher_name = 'aes-256-gcm';
            const crypto = require( 'crypto' );

            /* Buffered parameters. */
            let _message, _key, _iv, _salt, _authTag, _derived, _decrypt;

            /* Get the message as a buffer. */
            _message = _discordCrypt.__validateMessage( message, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Retrieve the auth tag. */
            _authTag = _message.slice( 0, block_cipher_size / 8 );

            /* Splice the message. */
            _message = _message.slice( block_cipher_size / 8 );

            /* Retrieve the 64-bit salt. */
            _salt = _message.slice( 0, 8 );

            /* Splice the message. */
            _message = _message.slice( 8 );

            /* Derive the key length and IV length. */
            // noinspection JSUnresolvedFunction
            _derived = Buffer.from(
                global.sha3.kmac_256(
                    _key,
                    _salt,
                    block_cipher_size + key_size_bits,
                    ENCRYPT_PARAMETER
                ),
                'hex'
            );

            /* Slice off the IV. */
            _iv = _derived.slice( 0, block_cipher_size / 8 );

            /* Slice off the key. */
            _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

            /* Create the cipher with IV. */
            _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

            /* Set the authentication tag. */
            _decrypt.setAuthTag( _authTag );

            /* Set the additional data for verification if necessary. */
            if ( additional_data !== undefined )
                _decrypt.setAAD( _discordCrypt.__toBuffer( additional_data ) );

            /* Disable automatic PKCS #7 padding. We do this in-house. */
            _decrypt.setAutoPadding( false );

            /* Decrypt the cipher text. */
            let _pt = _decrypt.update( _message, undefined, 'hex' );
            _pt += _decrypt.final( 'hex' );

            /* Unpad the message. */
            _pt = _discordCrypt.__padMessage( _pt, padding_mode, key_size_bits, true, true );

            /* Return the buffer. */
            return _pt.toString( output_format );
        }

        /**
         * @public
         * @desc Camellia-256 encrypts a message.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __camellia256_encrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            one_time_salt = undefined
        ) {
            /* Size constants for Camellia-256. */
            const keySize = 256, blockSize = 128;

            /* Perform the encryption. */
            return _discordCrypt.__encrypt(
                'camellia-256',
                cipher_mode,
                padding_mode,
                message,
                key,
                to_hex,
                is_message_hex,
                keySize,
                blockSize,
                one_time_salt
            );
        }

        /**
         * @public
         * @desc Camellia-256 decrypts a message.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __camellia256_decrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            /* Size constants for Camellia-256. */
            const keySize = 256, blockSize = 128;

            /* Return the unpadded message. */
            return _discordCrypt.__decrypt(
                'camellia-256',
                cipher_mode,
                padding_mode,
                message,
                key,
                output_format,
                is_message_hex,
                keySize,
                blockSize
            );
        }

        /**
         * @public
         * @desc TripleDES-192 encrypts a message.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __tripledes192_encrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            one_time_salt = undefined
        ) {
            /* Size constants for TripleDES-192. */
            const keySize = 192, blockSize = 64;

            /* Perform the encryption. */
            return _discordCrypt.__encrypt(
                'des-ede3',
                cipher_mode,
                padding_mode,
                message,
                key,
                to_hex,
                is_message_hex,
                keySize,
                blockSize,
                one_time_salt
            );
        }

        /**
         * @public
         * @desc TripleDES-192 decrypts a message.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __tripledes192_decrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            /* Size constants for TripleDES-192. */
            const keySize = 192, blockSize = 64;

            /* Return the unpadded message. */
            return _discordCrypt.__decrypt(
                'des-ede3',
                cipher_mode,
                padding_mode,
                message,
                key,
                output_format,
                is_message_hex,
                keySize,
                blockSize
            );
        }

        /**
         * @public
         * @desc IDEA-128 encrypts a message.
         * @param {string|Buffer|Array} message The input message to encrypt.
         * @param {string|Buffer|Array} key The key used with the encryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
         *      converted to a Base64 string.
         * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
         *      Key used to encrypt the message.
         * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
         * @throws An exception indicating the error that occurred.
         */
        static __idea128_encrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            to_hex = false,
            is_message_hex = undefined,
            one_time_salt = undefined
        ) {
            /* Size constants for IDEA-128. */
            const keySize = 128, blockSize = 64;

            /* Perform the encryption. */
            return _discordCrypt.__encrypt(
                'idea',
                cipher_mode,
                padding_mode,
                message,
                key,
                to_hex,
                is_message_hex,
                keySize,
                blockSize,
                one_time_salt
            );
        }

        /**
         * @public
         * @desc IDEA-128 decrypts a message.
         * @param {string|Buffer|Array} message The input message to decrypt.
         * @param {string|Buffer|Array} key The key used with the decryption cipher.
         * @param {string} cipher_mode The block operation mode of the cipher.
         *      This can be either [ 'CBC', 'CFB', 'OFB' ].
         * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
         *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
         * @param {string} output_format The output format of the decrypted message.
         *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
         * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
         *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
         * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
         *      options are invalid.
         * @throws Exception indicating the error that occurred.
         */
        static __idea128_decrypt(
            message,
            key,
            cipher_mode,
            padding_mode,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            /* Size constants for IDEA-128. */
            const keySize = 128, blockSize = 64;

            /* Return the unpadded message. */
            return _discordCrypt.__decrypt(
                'idea',
                cipher_mode,
                padding_mode,
                message,
                key,
                output_format,
                is_message_hex,
                keySize,
                blockSize
            );
        }

        /* ========================================================= */
    }

    /* Freeze the prototype. */
    _Object._freeze( _discordCrypt.prototype );

    /* Freeze the class definition. */
    _Object._freeze( _discordCrypt );

    return _discordCrypt;
} )();

/* Also freeze the method. */
Object.freeze( discordCrypt );

/* Required for code coverage reports. */
module.exports = { discordCrypt };


/*@end @*/
