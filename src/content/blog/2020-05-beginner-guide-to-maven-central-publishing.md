---
author: Julien Bras
pubDatetime: 2020-05-04 19:00:00
title: Beginner guide to Maven Central publishing
postSlug: beginner-guide-to-maven-central-publishing
featured: false
tags:
  - maven
  - java
  - opensource
description: A guide to publish a Java package to Maven Central
---

Maven Central is the central repository for Maven, the main Java repository where you can find libraries and components. Java developers are using this repository to create java application and manage efficiently dependencies.

> [!NOTE] Introduction
> I use to be very intimidated by pushing an artifact (i.e. a java package) to Maven Central, as it seems very complicated to me by the past. For example push to `npmjs` seems more easy (`npm publish` !).

This article is just a guide (at least for myself) on how to push easily some content to Maven Central, with just a *Github* account.

## Before starting why pushing to Central ?

Maybe you are asking yourself why pushing to Maven Central when we have in 2020 multiple way of releasing java package ?

- Maven Central is the main repository. You don't have to declare an additional `repository` in your `pom.xml`, it is just available by default in your Maven/Gradle... project.
- Other main repositories are generally synced to this main one. Here I will show you how to publish to [OSSRH](https://central.sonatype.org/pages/ossrh-guide.html) (OSS Repository Hosting) that is the main way to publish package. This repository is synced to Maven Central.
- There is not so much other solution available as pure repositories, for free (I want to publish open source content, I don't want to pay for that)
- [GitHub Package](https://github.com/features/packages) seems very promising **but** end-users must manipulate the `repositories` part of the `pom.xml` file and must be [authenticated](https://github.community/t5/GitHub-API-Development-and/Download-from-Github-Package-Registry-without-authentication/td-p/35255) even for public packages.

## First step, create account and get a groupId

- create a JIRA account [here](https://issues.sonatype.org/secure/Signup!default.jspa)
- Create a new issue using [this](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134) template.

![](/img/maven1.png)

The issue must describe the project you want to share. The most important information in the case is the `groupId`. The `groupId` is the main identification of you as a package provider, so it must be unique. It is generally an url in reverse order like : `to.dev`.

For a hobbyist developer using GitHub or equivalent git platform I recommend the following : `io.github.YOURUSERNAME`.

Once the ticket is created, you will have to prove that you *own* the `groupId` provided (for GitHub it's just a matter of create a new temporary project repo)

## Second step, make your project pretty

Here is the small maven project I want to share on Central:

[https://github.com/wiiisdom/biar-manager](https://github.com/wiiisdom/biar-manager)

It's a very simple library that is designed to read a specific file format.

There is a long list of requirement for your project to be accepted on OSSRH, you can read it [here](https://central.sonatype.org/pages/requirements.html).

To resume the requirements:

- you must supply javadoc (using `maven-javadoc-plugin` for example)
- you must supply sources (using `maven-source-plugin` for example)
- you must sign the files with GPG (using `maven-gpg-plugin` for example)
- the `pom.xml` file must contains enough metadata:
  - `groupId` (unique namespace like `io.github.USERNAME`)
  - `artifactId`
  - `version`
  - `name`
  - `description`
  - `url`
  - `licenses` part
  - `developers` part
  - `scm` section

For reference here his my [pom.xml](https://github.com/bobman38/biar-manager/blob/master/pom.xml) file that fit the requirements.

## Finally deploy !

Do not forget to install gpg and create a new key if you don't have one (I found again my key generated in 2004 yes I am old !)

```bash
brew install gpg # mac example
gpg --gen-key
```

Using Maven it is needed to use the right `distributionManagement` and help yourself by using the `nexus-staging-maven-plugin` plugin:

```xml
<distributionManagement>
  <snapshotRepository>
    <id>ossrh</id>
    <url>https://oss.sonatype.org/content/repositories/snapshots</url>
  </snapshotRepository>
</distributionManagement>
<build>
  <plugins>
    <plugin>
      <groupId>org.sonatype.plugins</groupId>
      <artifactId>nexus-staging-maven-plugin</artifactId>
      <version>1.6.7</version>
      <extensions>true</extensions>
      <configuration>
        <serverId>ossrh</serverId>
        <nexusUrl>https://oss.sonatype.org/</nexusUrl>
        <autoReleaseAfterClose>true</autoReleaseAfterClose>
      </configuration>
    </plugin>
    ...
  </plugins>
</build>
```

(again this is available in my [pom.xml](https://github.com/bobman38/biar-manager/blob/master/pom.xml))

You must auth on the OSSRH repository by modifying your `settings.xml` file under `~/.m2`:

```xml
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>your-jira-id</username>
      <password>your-jira-pwd</password>
    </server>
  </servers>
</settings>
```

Use the id and password you have created at the start of this article.

And then if your maven project have already the right version you can directly push to OSSRH using:

```bash
mvn clean deploy
```

The property `autoReleaseAfterClose` of `nexus-staging-maven-plugin` set to true will directly push the artifact from snapshot to the release repository.

**Note:** to change your Maven project version you can use the following:

```bash
mvn versions:set -DnewVersion=1.2.3 # set the version
mvn versions:commit # remove the pomBackup file
mvn versions:revert # back to previous version
```

After a few hours you will be able to see your package on [Maven Search](https://search.maven.org/)

![](/img/maven2.png)

**Nice job !**

## Other stuff to speak of

During my exploration I have found this tool : [https://jitpack.io/](https://jitpack.io/)

![](/img/maven3.png)

It seems to be an easy way to consume an existing git repository as maven dependency. I have not yet tested it but it feels like the *flexible* I miss with Maven (*Composer* for PHP allow to consume git repo, *npmjs* allow to consume git repo, etc...)

## References

- This article rely a lot on the OSSRH guide [here](https://central.sonatype.org/pages/ossrh-guide.html).

## Conclusion

Well there is more steps than `npmjs` but it is very affordable and you can do the same. Maybe it can be also the time for me to explore [Gradle](https://gradle.org/) or other new tooling around Java... Let me know if you have already pushed an artifact to Maven Central ? Thanks for reading !
