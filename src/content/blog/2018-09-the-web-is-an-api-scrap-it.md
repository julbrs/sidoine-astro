---
author: Julien Bras
pubDatetime: 2018-09-30 19:00:00
title: The Web is an API (scrap it!)
postSlug: the-web-is-an-api-scrap-it
featured: false
tags:
  - python
  - django
  - scraping
description: My first Python project, a web scraper to help me manage my library accounts
---

#python #scraping #django

> [!ATTENTION]
> This article is quite old (mid-2018). Since then, the project described below have evolved and it’s now mainly a **React application** with a **Node backend**. Check the new repository [here](https://github.com/julbrs/nelligan-plus)!

_How I have used the Python API BeautifulSoup to enhance a website._

I currently live in Montreal where we have very good public libraries to borrow books and all sort of things. Each time you take an item back home, a system is used to manage that. It comes with a public website that help you to check if you have to bring back the books or if you want to extend the loan period.

The point is that I have 3 kids, and my wife also have an account. Yep, we have 5 accounts on the system and things started to get difficult when I have to check on each account !

![](/img/nelligan1.png)
_Nelligan catalog, the end-user library system_

The catalog system is named *Nelligan*, but searching on the source of the [website](https://nelligan.ville.montreal.qc.ca/search), you will easily find it is a commercial solution named [III Encore](https://www.iii.com/products/sierra-ils/encore-discovery/). The public website doesn’t allow *multi-account* option of something.

My goal is be able to :

- Check quickly the date I need to bring back the books to the library to avoid fines
- Be able to extend the loan period

So let’s try to check if an API is existing in order to write something on top of that ! After a few days, I didn’t see anything. The company [III](https://www.iii.com/) seems to provide API but not something with a public interface… I just found a python lib [here](https://github.com/BenjaminEHowe/library-api) that is doing this kind of work on multiple commercial systems for library ; but the implementation of III Encore / Web PAC Pro (seems the same product) seems not finished.

I have decided to work a bit on this GitHub repository and I found very useful to invest time in [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/), that is a web-scrapper (ie you can read via a script what you want on the web !). Combined with the [Requests](http://docs.python-requests.org/en/master/) API, I have all the tools I need to make my project. I decided to use [Django](https://www.djangoproject.com/) for the web part just because everything was written in Python and because I want to learn it !

Mainly the game is not so hard :

- Find a way to login via Request API :

```plain
login = {'code': code, 'pin': pin}
r = requests.post(NELLIGAN_URL + '/patroninfo/?', data = login)
```

- Then find a way to read the data I want in the page :

```plain
# Grab loans (currently taken)
soup = BeautifulSoup(r.text, 'html.parser')
items = soup.select("tr.patFuncEntry")
for item in items:
    # do things on books
```

My main service file is [here](https://github.com/bobman38/nelligan/blob/master/library/services.py), it contains all the calls to the website. It allow me to test the card, grab the actual loans, extend the loan for a book, request for books, view the fine associated with each card…

It is then very easy to order books by end-of-loan date…

![](/img/nelligan2.png)
_Books ordered by end of loan date, from multiple cards_

To get more on this application here is some links:

- the [GitHub repository](https://github.com/julbrs/nelligan)
- the application on an Heroku dyno (hobby one please wait !) (_no more up and running since the Heroku new politics_)

My next goal on this application ? I really want to contribute on this [project](https://github.com/BenjaminEHowe/library-api) to have a global API for library management (not only a single commercial app !). Then integrate this API in my web application (not only Montreal Nelligan system focus). And also one day trying to reproduce the API in a different language like JS for a equivalent NodeJS system.
