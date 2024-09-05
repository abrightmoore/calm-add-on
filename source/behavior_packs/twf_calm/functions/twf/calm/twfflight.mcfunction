execute as @a[tag=twf_calm_elytra] at @s if block ~ ~-1 ~ air run tag @s add twf_calm_fly

execute as @a[tag=twf_calm_fly,rxm=-90,rx=-60] run effect @s levitation 1 6 true

execute as @a[tag=twf_calm_fly,rxm=-60,rx=-30] run effect @s levitation 1 3 true

execute as @a[tag=twf_calm_fly,rxm=-30,rx=-5] run effect @s levitation 1 2 true

execute as @a[tag=twf_calm_fly,rxm=-5,rx=20] run effect @s levitation 1 1 true

execute as @a[tag=twf_calm_fly,rxm=20,rx=40] run effect @s levitation 1 0 true

execute as @a[tag=twf_calm_fly,rxm=40,rx=60] run effect @s slow_falling 1 1 true

execute as @a[tag=twf_calm_fly,rxm=60,rx=90] run effect @s clear

execute as @a[tag=twf_calm_fly,rxm=60,rx=90] run effect @s jump_boost 1 10 true

tag @a[tag=twf_calm_fly] remove twf_calm_fly