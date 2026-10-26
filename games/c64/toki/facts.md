# Toki — verified technical facts

What is true of the game as a whole: how its parts follow one another, and what they share.
Each part's own facts are in `parts/<id>/facts.md`.

## Parts

- `resident`: the engine with stage 1 in play (`parts/resident/work/play.vsf`, the same snapshot as before). It owns every address except the ranges below.
- `stage-1` to `stage-5`: one part for each stage, `over` resident. Each owns the three ranges its stage load writes (cartridge directory entries 17-31, "Cartridge directory" in `parts/resident/facts.md`): the character set at $C000, the code at $BD76, and the unpacked block from $0C01. Each has its own snapshot of that stage in play (`parts/stage-N/work/play.vsf`), made with the stage-skip cheat.
- The patcher `patch_stage_code` ($4DDB) counts stages from 0 (`$08E7`), so `stage2_patch` patches the second stage as the player counts it, and so on; the bytes each patch writes are documented in the part of the stage they belong to.
