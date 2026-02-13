/**
 * Simple Twitter Embed Tool for Editor.js
 * Allows users to embed Twitter/X posts by pasting the tweet URL
 */

class TwitterEmbed {
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.wrapper = null;
  }

  static get toolbox() {
    return {
      title: 'Twitter',
      icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M15.063 3.571c.011.214.011.429.011.643 0 6.536-4.973 14.071-14.071 14.071v-.004A13.978 13.978 0 0 1 0 16.429a9.925 9.925 0 0 0 7.304-2.043 4.963 4.963 0 0 1-4.632-3.443 4.95 4.95 0 0 0 2.239-.085A4.957 4.957 0 0 1 1.031 6.07v-.063a4.932 4.932 0 0 0 2.246.62A4.962 4.962 0 0 1 1.744.981a14.07 14.07 0 0 0 10.217 5.182 4.959 4.959 0 0 1 8.449-4.52 9.942 9.942 0 0 0 3.146-1.203 4.974 4.974 0 0 1-2.18 2.74A9.876 9.876 0 0 0 24 2.305a10.068 10.068 0 0 1-2.475 2.566z"/></svg>'
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('twitter-embed-tool');

    if (this.data && this.data.url) {
      this._createEmbed();
    } else {
      this._createInput();
    }

    return this.wrapper;
  }

  _createInput() {
    const input = document.createElement('input');
    input.placeholder = 'Paste Twitter/X post URL here...';
    input.value = this.data.url || '';
    input.classList.add('cdx-input');
    input.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;';

    input.addEventListener('paste', (e) => {
      setTimeout(() => {
        const url = input.value.trim();
        if (url && (url.includes('twitter.com') || url.includes('x.com'))) {
          this.data.url = url;
          this._createEmbed();
        }
      }, 100);
    });

    input.addEventListener('blur', () => {
      const url = input.value.trim();
      if (url && (url.includes('twitter.com') || url.includes('x.com'))) {
        this.data.url = url;
        this._createEmbed();
      }
    });

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(input);
  }

  _createEmbed() {
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 16px 0;';

    // Extract tweet ID from URL
    const tweetId = this._extractTweetId(this.data.url);
    
    if (tweetId) {
      // Use Twitter's embed iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
      iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('loading', 'lazy');
      
      container.appendChild(iframe);
    } else {
      // Fallback: show link
      const link = document.createElement('a');
      link.href = this.data.url;
      link.target = '_blank';
      link.textContent = this.data.url;
      link.style.cssText = 'color: #1da1f2; text-decoration: none; padding: 20px; display: block;';
      container.appendChild(link);
    }

    // Add edit button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️ Edit';
    editBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; padding: 6px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 12px; z-index: 10;';
    editBtn.addEventListener('click', () => {
      this._createInput();
    });
    container.appendChild(editBtn);

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(container);
  }

  _extractTweetId(url) {
    // Extract tweet ID from various Twitter URL formats
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
      /twitter\.com\/\w+\/statuses\/(\d+)/,
      /x\.com\/\w+\/statuses\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
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

    return savedData.url.includes('twitter.com') || savedData.url.includes('x.com');
  }

  static get isReadOnlySupported() {
    return true;
  }
}

export default TwitterEmbed;

