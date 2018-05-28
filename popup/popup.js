'use strict';

const settings = {
  // Имя хабровчанина из настроек
  user: localStorage['options.html#habroname'] || '',
  // domains: ['habr.com', 'geektimes.com']
  // Geektimes переехал на Хабр
  // 28 мая 2018 года Geektimes стал частью Хабра.
  // Все публикации с комментариями переехали в поток «Гиктаймс».
  domains: ['habr.com'],
  page: {
    selectors: {
      post:       ':scope > .content-list__item_post > .post',
      title:      ':scope .post__title',
      published:  ':scope .post__time',
      hubs:       ':scope .post__hubs',
      content:    ':scope .post__body',
      nextpage:   '#next_page',
      prevpage:   '#previous_page',
      firstpage:  '#nav-pagess li:first-child > a',
      lastpage:   '#nav-pagess li:last-child > a'
    }
  },

  rules: {
    favorites: {
      url: 'https://<domain>/users/<user>/favorites/page<page>/',
      selector: '.user_favorites > .content-list'
    },
    feed: {
      url: 'https://<domain>/feed/',
      selector: '.posts_list > .content-list'
    }
  }
};

const HabrLoader = (settings => {

  const ajax = (url, callback) => fetch(url)
      .then(r => r.text())
      .then(callback);

  const format = (string, keys) =>
    string.replace(/<(\w+)>/g, (capture, key) => keys[key] || capture)
  ;

  const createSpoiler = (content) => {
    content.style = 'display:none';
    const style = content.style;
    const button = document.createElement('input');
    button.type = 'button';
    button.value = 'Preview';
    button.onclick = (e) => {
      style.display = style.display == 'none' ? 'block' : 'none';
    };
    return button;
  };

  return {
    get: (query, callback) => {

      if (settings.user === '') {
        const error = 'Зайдите в настройки и укажите хаброимя';
        document.writeln(error);
        console.error(error);
        return;
      }

      settings.domains.forEach(domain => {
        const processPage = text => {
          const selectors = settings.page.selectors;
          const parser = new DOMParser();
          const dom = parser.parseFromString(text, "text/html");
          const doc = dom.documentElement;
          const aNextPage = doc.querySelector(selectors.nextpage);
          const root = doc.querySelector(settings.rules.favorites.selector);

          const append = (node, selector) => {
            const imported = document.importNode(node.querySelector(selector), true);
            document.body.appendChild(imported);
            return imported;
          };

          for (let post of root.querySelectorAll(selectors.post)) {
            append(post, selectors.title);
            append(post, selectors.published);
            append(post, selectors.hubs);
            let content = append(post, selectors.content);
            document.body.insertBefore(createSpoiler(content), content);
          }

          if (aNextPage && aNextPage.getAttribute('href')) {
            ajax('https://' + domain + aNextPage.getAttribute('href'), processPage);
          } else {
            for (let a of document.querySelectorAll('.post__title > a')) {
              a.target = '_blank'
            }
          }

        };

        const url = format(settings.rules.favorites.url, {
          domain: domain,
          user: settings.user,
          page: 1
        });

        ajax(url, processPage);

      });

    }
  };
})(settings);

document.addEventListener('DOMContentLoaded', event => HabrLoader.get());

