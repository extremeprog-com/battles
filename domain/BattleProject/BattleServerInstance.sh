#!/bin/bash

# BattleServerInstance
# BattleServerInstanceControl
# BattleServerInstanceControl_StartRq
# BattleServerInstanceControl_SelfCheckRq
# BattleServerInstanceInternals
# BattleServerInstanceInternalsControl_GetStructure [ TVConnections: { num: int, state2num: string -> int, log_time2num, float -> int } ]
# BattleServerInstanceInternalsControl_SetValue (path -> value)
# BattleServerInstanceData
# BattleServerInstanceDataControl_GetStructure [ ]
# BattleServerInstanceDataControl_SetValue (path -> value)
# BattleServerInstanceTopology [ depends: { BattleRedisServer: RedisServer } , promotes: { BattleServer } ]
# BattleServerInstanceTopology_RefreshRequest
# BattleServerInstanceTopologyControl
# BattleServerInstanceTopologyControl_GetDependenciesRq
# BattleServerInstanceTopologyControl_OrderAutomaticRq
# BattleServerInstanceTopologyControl_OrderManualRq
# BattleServerInstanceTopologyControl_CreateResourceRq (resource, settings)
# BattleServerInstanceTopologyControl_DeleteResourceRq (resource, settings)
# BattleServerInstanceTopologyControl_UpdateResourceRq (resource, settings)
# BattleServerInstanceResources
# BattleServerInstanceResourcesControl
# BattleServerInstanceResourcesControl_MineRq { mem: float, cpu : float, disk: float }
# BattleServerInstanceResourcesControl_FreezeRq {  }
# BattleServerInstanceResourcesControl_LimitRq {  }
# BattleServerInstanceLogging
# BattleServerInstanceLogging_Message
# BattleServerInstanceLoggingControl_SetVerboseRq


# BattleServerInstance
# BattleServerInstanceAdmin
# BattleServerInstanceAdminLogging
# BattleServerInstanceAdminMonitoring
# BattleServerInstanceAdminPanel
# BattleServerInstanceAdminCli
# BattleServerInstanceAutomation
# BattleServerInstanceAutomationCluster
# BattleServerInstanceAutomationOS
# BattleServerInstanceAutomationStat
# BattleServerInstanceAutomationRunners
# BattleServerInstanceAutomationTopology



# human: first-time setup

BattleServerInstance::firstTimeSetup() {
   Catch Cli_Cmd if CMD="BattleServerInstance start" before BattleServerInstance::start_server

   -> fds
   <- sdsf

}

BattleServerInstance::firstTimeSetup_Check() {
   # todo: check that pid is exists and running, redis is ok

   return 255;
}


# human: control


BattleServerInstance::start_server_via() {
   Catch Cli_Cmd if CMD="BattleServerInstance start" and USER=root, BattleServerInstanceControl_StartRq



}


# human: data manipulation


BattleServerInstance::get_num_connections() {
   Catch Cli_Cmd if CMD="BattleServerInstance num_connections",



}


# physical resources: mine statistics



# physical resources: freeze on overload



# physical resources: limitations



# OS: process controll



# OS: user rights



# OS: network settings



# Cluster: run on remote machine



# Cluster: choose machine



# Logging system: write actions



# Logging system: verbose mode on/off



# Monitoring system: internal structure report



# Monitoring system: internal objects state report



# Monitoring system: resources usage



# Topology control: internal topology and dependency report



# Topology control: refresh topology requests



# Topology control: labels for manual or automatical topology settings



# Topology control: control API





