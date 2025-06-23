Setup, install dependencies:

```
bundle install
```

To build:

```
jekyll serve
```

To release:

```
rm -rf ../frontend/public/help
cp -a _site !$
cd ../frontend
git commit -a -m 'released from help repo'
git push
```
