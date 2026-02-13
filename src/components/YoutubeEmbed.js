/**
 * Simple YouTube Embed Tool for Editor.js
 * Allows users to embed YouTube videos by pasting the video URL
 */

class YoutubeEmbed {
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.wrapper = null;
  }

  static get toolbox() {
    return {
      title: 'YouTube',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.582,5.543 C21.328,4.588 20.58,3.834 19.626,3.58 C17.893,3.117 12,3.117 12,3.117 C12,3.117 6.107,3.117 4.374,3.58 C3.42,3.834 2.672,4.588 2.418,5.543 C1.956,7.275 1.956,12 1.956,12 C1.956,12 1.956,16.725 2.418,18.457 C2.672,19.412 3.42,20.166 4.374,20.42 C6.107,20.883 12,20.883 12,20.883 C12,20.883 17.893,20.883 19.626,20.42 C20.58,20.166 21.328,19.412 21.582,18.457 C22.044,16.725 22.044,12 22.044,12 C22.044,12 22.044,7.275 21.582,5.543 Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10,15 L16,12 L10,9 L10,15 Z" fill="currentColor"/></svg>'
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('youtube-embed-tool');

    if (this.data && this.data.url) {
      this._createEmbed();
    } else {
      this._createInput();
    }

    return this.wrapper;
  }

  _createInput() {
    const input = document.createElement('input');
    input.placeholder = 'Paste YouTube video URL here...';
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
    container.style.cssText = 'position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 16px 0; background-color: #000;';

    // Extract video ID logic
    const videoId = this._extractVideoId(this.data.url);
    
    if (videoId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      
      container.appendChild(iframe);
    } else {
      // Fallback
      const link = document.createElement('a');
      link.href = this.data.url;
      link.target = '_blank';
      link.textContent = this.data.url;
      link.style.cssText = 'color: #ff0000; text-decoration: none; padding: 20px; display: block;';
      container.appendChild(link);
    }

    // Add edit button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️ Edit';
    editBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; padding: 6px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 12px; z-index: 10; color: #000;';
    editBtn.addEventListener('click', () => {
      this._createInput();
    });
    container.appendChild(editBtn);

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(container);
  }

  _extractVideoId(url) {
    if (!url) return null;
    
    // RegEx patterns for YouTube URLs
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/shorts\/([^"&?\/\s]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
  
  _isValidUrl(url) {
    return !!this._extractVideoId(url);
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

export default YoutubeEmbed;

