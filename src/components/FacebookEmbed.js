/**
 * Simple Facebook Embed Tool for Editor.js
 * Allows users to embed Facebook posts and videos by pasting the URL
 */

class FacebookEmbed {
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.wrapper = null;
  }

  static get toolbox() {
    return {
      title: 'Facebook',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('facebook-embed-tool');

    if (this.data && this.data.url) {
      this._createEmbed();
    } else {
      this._createInput();
    }

    return this.wrapper;
  }

  _createInput() {
    const input = document.createElement('input');
    input.placeholder = 'Paste Facebook post/video URL here...';
    input.value = this.data.url || '';
    input.classList.add('cdx-input');
    input.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;';

    input.addEventListener('paste', (e) => {
      setTimeout(() => {
        const url = input.value.trim();
        if (this._isValidUrl(url)) {
          this.data.url = url;
          this._createEmbed();
        }
      }, 100);
    });

    input.addEventListener('blur', () => {
      const url = input.value.trim();
      if (this._isValidUrl(url)) {
        this.data.url = url;
        this._createEmbed();
      }
    });

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(input);
  }

  _createEmbed() {
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; width: 100%; min-height: 100px; padding: 10px; margin: 16px 0; background-color: transparent; display: flex; justify-content: center;';

    const cleanUrl = this._normalizeUrl(this.data.url);
    
    // Check if it's a video
    const isVideo = cleanUrl.includes('/videos/') || cleanUrl.includes('/watch') || cleanUrl.includes('/reel/');
    const className = isVideo ? 'fb-video' : 'fb-post';

    // Create the SDK container
    // We wrap it in a div that we can target
    const embedDiv = document.createElement('div');
    embedDiv.classList.add(className);
    embedDiv.setAttribute('data-href', cleanUrl);
    embedDiv.setAttribute('data-width', '500');
    embedDiv.setAttribute('data-show-text', 'true'); // Show text for posts
    if (isVideo) {
        embedDiv.setAttribute('data-show-text', 'false'); // Usually hide text for videos to look cleaner
        embedDiv.setAttribute('data-allowfullscreen', 'true');
    }
    
    container.appendChild(embedDiv);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️ Edit';
    editBtn.style.cssText = 'position: absolute; top: -10px; right: 0; padding: 4px 8px; background: #eee; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 10px; z-index: 99; opacity: 0.5;';
    editBtn.addEventListener('mouseenter', () => editBtn.style.opacity = '1');
    editBtn.addEventListener('mouseleave', () => editBtn.style.opacity = '0.5');
    editBtn.addEventListener('click', () => {
      this._createInput();
    });
    container.appendChild(editBtn);

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(container);

    // Load SDK and Parse
    this._loadFacebookSdk().then(() => {
        if (window.FB) {
            // We need to ensure the element is in DOM before parsing, 
            // but Editor.js might not have appended it yet.
            // Parse the new element specifically.
            try {
                window.FB.XFBML.parse(this.wrapper);
            } catch (e) {
                console.warn('FB Parse error', e);
            }
            
            // Re-parse after a slight delay to ensure DOM insertion
            setTimeout(() => {
                if (window.FB && this.wrapper.isConnected) {
                    window.FB.XFBML.parse(this.wrapper);
                }
            }, 500);
        }
    });
  }

  _loadFacebookSdk() {
    return new Promise((resolve) => {
        if (window.FB) {
            resolve();
            return;
        }

        // Check if script is already loading
        if (document.getElementById('facebook-jssdk')) {
            // Wait for it
            const interval = setInterval(() => {
                if (window.FB) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
            return;
        }

        // Create fb-root if missing
        if (!document.getElementById('fb-root')) {
            const fbRoot = document.createElement('div');
            fbRoot.id = 'fb-root';
            document.body.appendChild(fbRoot);
        }

        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
  }
  
  _normalizeUrl(url) {
    if (!url) return '';
    let clean = url.trim();
    
    // Replace mobile domains
    clean = clean.replace('://m.facebook.com', '://www.facebook.com');
    clean = clean.replace('://mobile.facebook.com', '://www.facebook.com');
    clean = clean.replace('://web.facebook.com', '://www.facebook.com');
    
    // Strip params for cleaner look, but keep ID
    // SDK ignores valid params usually, but better safe
    try {
        const urlObj = new URL(clean);
        // Important: Remove 'fbclid'
        urlObj.searchParams.delete('fbclid');
        clean = urlObj.toString();
    } catch (e) {}
    
    return clean;
  }
  
  _isValidUrl(url) {
    if (!url) return false;
    return url.match(/^(https?:\/\/)?(www\.|m\.|mobile\.|web\.)?(facebook\.com|fb\.watch|fb\.com)\/.+/i);
  }

  save() {
    return {
      url: this.data.url || ''
    };
  }

  validate(savedData) {
    if (!savedData.url || !savedData.url.trim()) {
      return false;
    }
    return this._isValidUrl(savedData.url);
  }

  static get isReadOnlySupported() {
    return true;
  }
}

export default FacebookEmbed;

