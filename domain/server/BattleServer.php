<?php

class BattleServer extends NginxFrontend {

    use RedisStorage;

    static function getSiteNames() {
        return ['battle.lo', 'battle.test.karaoke.ru'];
    }

    static function publishBattleServerUrl() {
        /** @var NginxFrontend_MakeConfig $Event */
        $Event = CatchEvent(BattleServer_MakeConfig::class);
        $Event->NginxConfig->sections['location /battle'] = "
            location /battle {
                proxy_pass http://unix:".PROJECTENV."/var/".__CLASS__.".sock:;
                proxy_http_version 1.1;
                proxy_set_header Host \$http_origin_host;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection \"upgrade\";
            }
        ";
    }

    static function daemon() {
        CatchEvent(\_OS\Core\System_InitDaemons::class);
        $__CLASS__ = __CLASS__;
        Taskman::installDaemonUnderTaskman(__METHOD__, "node domain/server/$__CLASS__.js");
    }

    static function installNpmModules() {
        CatchEvent(\_OS\Core\System_InitConfigs::class);

        $__CLASS__ = __CLASS__;

        passthru(<<<EOF
            for i in gulp `grep require domain/server/$__CLASS__.js | grep -oE "'[^']+'" | grep -oE "[^']+"`; do cd \$HOME; node -e "require('\$i')" || npm install \$i ; done
EOF
        );


    }


}