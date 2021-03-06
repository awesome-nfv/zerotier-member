# ZeroTier Member

A small service to update member data on a [ZeroTier](https://www.zerotier.com/) network.

It is meant to be used in conjuction with the [zerotier service](https://hub.docker.com/r/zerotier/zerotier-containerized/).   
I use it to authorize [linuxkit](https://github.com/linuxkit/linuxkit) nodes onto ZT networks :zap::tada:.

## Use

```
docker run asbjornenge/zerotier-member:latest --data '{ "config": { "authorized": true }}' --network <network> --zerotier-api-key <key> 
```

The following will pull the latest `asbjornenge/zerotier-member` image from the [docker hub]() and run it.
The service will wait for zerotier to generate an `identity`, then attempt to update the member data on the passed network.
If successful, the service will exit (unless `keepalive` is passed). 

## Options

```
data              - The data to set (required - consult the ZeroTier API for options)
network           - Network `id` to connect to (required)
zerotier-api-key  - ZeroTier API key (required)
retry             - Number of retries before giving up - passing 0 will retry forever (default: 0)
interval          - Interval between retries (default: 5000)
keepalive         - Keep service running (default: false)
zerotier-home     - ZeroTier config folder (default: /var/lib/zerotier-one)
```

Options can be passe either as parameters or as ENV variable (with a ZM\_ prefix; `ZM_ZEROTIER_HOME`).

## Changelog

### v1.0.1

* Now using [pkg](https://github.com/zeit/pkg) to build binary and `FROM: alpine` in Dockerfile to dramatically shring size of container (265mb -> 14mb) :tada:

### v1.0.0

* Initial release :tada:

enjoy. 
