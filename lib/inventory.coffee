_      = require "underscore"
procs  = require "child_process"
script = "#{__dirname}/../bin/ec2.py"

transform = (env, inv) ->
    roles = {}
    envHosts = inv["tag_env_#{env}"] ? []

    # remove non-prod servers from _meta: hostvars
    for host, data of inv["_meta"]["hostvars"]
        if host in envHosts
            # make sure it has the env variable
            data["env"] = data["ec2_tag_env"]
            # make sure it has a name
            data["name"] = data["ec2_tag_Name"] or host
        else
            delete inv["_meta"]["hostvars"][host]

    # remove non-prod servers from other groups
    for group, hosts of inv
        if _.isArray hosts
            i = hosts.length
            while i > 0
                host = hosts[--i]
                unless host in envHosts
                    hosts.splice i, 1

    for key, val of inv
        if key.match /^tag_roles/
            # get the roles and put the 
            for role in key.split("_")[2..]
                roles[role] ?= []
                roles[role] = roles[role].concat val
            delete inv[key]

    for role, hosts of roles
        inv[role] = hosts

    inv[env]     = inv["tag_env_#{env}"]
    inv["linux"] = inv["tag_env_#{env}"]

    return inv

list = (env, done) ->
    inv  = ""
    proc = procs.spawn script, ["--list"]

    proc.stdout.on "data", (data) ->
        inv += data

    proc.on "error", (err) ->
        if err.toString().match "ENOENT"
            console.error "Can't execute ec2.py. Is it in your PATH?"
        else
            console.error "Error: #{err}"

    proc.on "close", (code) ->
        if code is 0
            try
                inv = JSON.parse inv
            catch e
                return done e
            
            inv = transform env, inv
            done null, inv
        else
            done "Error: ec2.py exited with #{code}"
    
exports.list = list