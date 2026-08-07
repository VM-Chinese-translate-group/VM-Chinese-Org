-- 仅用于手动测试。不要在正式数据库执行本文件。
-- 执行前先确保目标是独立的本地 D1 或专门的测试 D1。

INSERT OR IGNORE INTO feedback_items (
  id, category, subtype, subtypes, canonical_key, display_name, normalized_name,
  status, cover_url, cover_platform, vote_count, created_at, updated_at
) VALUES
  (
    'test-create-above-beyond', 'modpack', 'technology', 'technology,magic',
    'modrinth:create-above-and-beyond', 'Create: Above and Beyond', 'create above and beyond',
    'candidate', NULL, 'Modrinth', 0, '2026-08-06T00:00:00.000Z', '2026-08-06T00:00:00.000Z'
  ),
  (
    'test-kitchen-sink-pack', 'modpack', 'kitchen_sink', 'kitchen_sink,technology',
    'curseforge:test-kitchen-sink-pack', 'Test Kitchen Sink Pack', 'test kitchen sink pack',
    'planned', NULL, 'CurseForge', 0, '2026-08-06T00:01:00.000Z', '2026-08-06T00:01:00.000Z'
  ),
  (
    'test-horror-parkour-map', 'map', 'horror', 'horror,parkour',
    'minecraft-maps:test-horror-parkour-map', 'Test Horror Parkour Map', 'test horror parkour map',
    'candidate', NULL, 'Minecraft Maps', 0, '2026-08-06T00:02:00.000Z', '2026-08-06T00:02:00.000Z'
  ),
  (
    'test-other-project', 'other', 'other', 'other',
    'planet-minecraft:test-other-project', 'Test Other Project', 'test other project',
    'candidate', NULL, 'Planet Minecraft', 0, '2026-08-06T00:03:00.000Z', '2026-08-06T00:03:00.000Z'
  );

INSERT OR IGNORE INTO feedback_sources (item_id, platform, url, normalized_url, external_id, is_primary, created_at) VALUES
  ('test-create-above-beyond', 'Modrinth', 'https://modrinth.com/modpack/create-above-and-beyond', 'https://modrinth.com/modpack/create-above-and-beyond', 'create-above-and-beyond', 1, '2026-08-06T00:00:00.000Z'),
  ('test-kitchen-sink-pack', 'CurseForge', 'https://www.curseforge.com/minecraft/modpacks/test-kitchen-sink-pack', 'https://www.curseforge.com/minecraft/modpacks/test-kitchen-sink-pack', 'test-kitchen-sink-pack', 1, '2026-08-06T00:01:00.000Z'),
  ('test-horror-parkour-map', 'Minecraft Maps', 'https://www.minecraftmaps.com/test-horror-parkour-map', 'https://www.minecraftmaps.com/test-horror-parkour-map', 'test-horror-parkour-map', 1, '2026-08-06T00:02:00.000Z'),
  ('test-other-project', 'Planet Minecraft', 'https://www.planetminecraft.com/project/test-other-project/', 'https://www.planetminecraft.com/project/test-other-project', 'test-other-project', 1, '2026-08-06T00:03:00.000Z');

INSERT OR IGNORE INTO feedback_aliases (item_id, alias, normalized_alias, created_at) VALUES
  ('test-create-above-beyond', 'CAB', 'cab', '2026-08-06T00:00:00.000Z'),
  ('test-horror-parkour-map', '恐怖跑酷测试地图', '恐怖跑酷测试地图', '2026-08-06T00:02:00.000Z');
