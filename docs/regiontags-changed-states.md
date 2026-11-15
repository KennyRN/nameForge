# British dialect words: changed states

Shared tables brief §13.3 (15 November 2026). The words in `regionTags` of `wilds.json`, `waters.json` and `places.json` are now drawn only for the british culture group and norse (weight 0 elsewhere). The leak is older than brief 3: `regionMult` returned 1 for any culture that was not British at home from the wild lands M1 and M5 commits (19 October 2026, `2185aae` and `deec3fa`), long before the lens, one-sentence and place split briefs.

Fixture states whose names changed, by module, with the seeds folded together (a state is a module, a culture or kind, a setting and a seed).

## lens-baseline: 843 states

| State | Seeds changed |
|---|---|
| seasLakes general default | 2 |
| seasLakes general MO | 3 |
| seasLakes roman default | 3 |
| seasLakes roman MO | 3 |
| seasLakes greek-byzantine default | 3 |
| seasLakes greek-byzantine MO | 3 |
| seasLakes slavic default | 2 |
| seasLakes slavic MO | 2 |
| seasLakes steppe default | 2 |
| seasLakes steppe MO | 2 |
| seasLakes arabic-persian default | 3 |
| seasLakes arabic-persian MO | 3 |
| seasLakes indian default | 3 |
| seasLakes indian MO | 3 |
| seasLakes chinese default | 2 |
| seasLakes chinese MO | 2 |
| seasLakes japanese default | 2 |
| seasLakes japanese MO | 2 |
| seasLakes korean default | 2 |
| seasLakes korean MO | 2 |
| seasLakes egyptian default | 3 |
| seasLakes egyptian MO | 3 |
| seasLakes ethiopian default | 3 |
| seasLakes ethiopian MO | 3 |
| seasLakes bantu default | 3 |
| seasLakes bantu MO | 3 |
| seasLakes west-african default | 2 |
| seasLakes west-african MO | 3 |
| seasLakes aztec default | 2 |
| seasLakes aztec MO | 3 |
| seasLakes maya default | 2 |
| seasLakes maya MO | 3 |
| seasLakes polynesian default | 3 |
| seasLakes polynesian MO | 3 |
| seasLakes andean default | 2 |
| seasLakes andean MO | 3 |
| coastsIslands general default | 3 |
| coastsIslands general MO | 3 |
| coastsIslands roman default | 3 |
| coastsIslands roman MO | 3 |
| coastsIslands greek-byzantine default | 3 |
| coastsIslands greek-byzantine MO | 3 |
| coastsIslands slavic default | 3 |
| coastsIslands slavic MO | 3 |
| coastsIslands steppe default | 3 |
| coastsIslands steppe MO | 3 |
| coastsIslands arabic-persian default | 3 |
| coastsIslands arabic-persian MO | 3 |
| coastsIslands indian default | 3 |
| coastsIslands indian MO | 3 |
| coastsIslands chinese default | 3 |
| coastsIslands chinese MO | 3 |
| coastsIslands japanese default | 3 |
| coastsIslands japanese MO | 3 |
| coastsIslands korean default | 3 |
| coastsIslands korean MO | 3 |
| coastsIslands egyptian default | 3 |
| coastsIslands egyptian MO | 3 |
| coastsIslands ethiopian default | 3 |
| coastsIslands ethiopian MO | 3 |
| coastsIslands bantu default | 3 |
| coastsIslands bantu MO | 3 |
| coastsIslands west-african default | 3 |
| coastsIslands west-african MO | 3 |
| coastsIslands aztec default | 3 |
| coastsIslands aztec MO | 3 |
| coastsIslands maya default | 3 |
| coastsIslands maya MO | 3 |
| coastsIslands polynesian default | 3 |
| coastsIslands polynesian MO | 3 |
| coastsIslands andean default | 3 |
| coastsIslands andean MO | 3 |
| seaCharts general default | 3 |
| seaCharts general MO | 3 |
| seaCharts roman default | 3 |
| seaCharts roman MO | 3 |
| seaCharts greek-byzantine default | 3 |
| seaCharts greek-byzantine MO | 3 |
| seaCharts slavic default | 2 |
| seaCharts slavic MO | 3 |
| seaCharts steppe default | 3 |
| seaCharts steppe MO | 3 |
| seaCharts arabic-persian default | 3 |
| seaCharts arabic-persian MO | 3 |
| seaCharts indian default | 2 |
| seaCharts indian MO | 3 |
| seaCharts chinese default | 3 |
| seaCharts chinese MO | 2 |
| seaCharts japanese default | 2 |
| seaCharts japanese MO | 3 |
| seaCharts korean default | 2 |
| seaCharts korean MO | 3 |
| seaCharts egyptian default | 2 |
| seaCharts egyptian MO | 3 |
| seaCharts ethiopian default | 3 |
| seaCharts ethiopian MO | 3 |
| seaCharts bantu default | 3 |
| seaCharts bantu MO | 3 |
| seaCharts west-african default | 3 |
| seaCharts west-african MO | 3 |
| seaCharts aztec default | 3 |
| seaCharts aztec MO | 3 |
| seaCharts maya default | 3 |
| seaCharts maya MO | 3 |
| seaCharts polynesian default | 3 |
| seaCharts polynesian MO | 3 |
| seaCharts andean default | 3 |
| seaCharts andean MO | 3 |
| mountainNames general default | 3 |
| mountainNames general MO | 3 |
| mountainNames roman default | 3 |
| mountainNames roman MO | 3 |
| mountainNames greek-byzantine default | 3 |
| mountainNames greek-byzantine MO | 3 |
| mountainNames slavic default | 3 |
| mountainNames slavic MO | 3 |
| mountainNames steppe default | 3 |
| mountainNames steppe MO | 3 |
| mountainNames arabic-persian default | 3 |
| mountainNames arabic-persian MO | 3 |
| mountainNames indian default | 3 |
| mountainNames indian MO | 3 |
| mountainNames chinese default | 3 |
| mountainNames chinese MO | 3 |
| mountainNames japanese default | 3 |
| mountainNames japanese MO | 3 |
| mountainNames korean default | 3 |
| mountainNames korean MO | 3 |
| mountainNames egyptian default | 3 |
| mountainNames egyptian MO | 3 |
| mountainNames ethiopian default | 3 |
| mountainNames ethiopian MO | 3 |
| mountainNames bantu default | 3 |
| mountainNames bantu MO | 3 |
| mountainNames west-african default | 3 |
| mountainNames west-african MO | 3 |
| mountainNames aztec default | 3 |
| mountainNames aztec MO | 3 |
| mountainNames maya default | 3 |
| mountainNames maya MO | 3 |
| mountainNames polynesian default | 3 |
| mountainNames polynesian MO | 3 |
| mountainNames andean default | 3 |
| mountainNames andean MO | 3 |
| forestNames general default | 3 |
| forestNames general MO | 3 |
| forestNames roman default | 3 |
| forestNames roman MO | 3 |
| forestNames greek-byzantine default | 3 |
| forestNames greek-byzantine MO | 3 |
| forestNames slavic default | 3 |
| forestNames slavic MO | 3 |
| forestNames steppe default | 3 |
| forestNames steppe MO | 3 |
| forestNames arabic-persian default | 3 |
| forestNames arabic-persian MO | 3 |
| forestNames indian default | 3 |
| forestNames indian MO | 3 |
| forestNames chinese default | 3 |
| forestNames chinese MO | 3 |
| forestNames japanese default | 3 |
| forestNames japanese MO | 3 |
| forestNames korean default | 3 |
| forestNames korean MO | 3 |
| forestNames egyptian default | 3 |
| forestNames egyptian MO | 3 |
| forestNames ethiopian default | 3 |
| forestNames ethiopian MO | 3 |
| forestNames bantu default | 3 |
| forestNames bantu MO | 3 |
| forestNames west-african default | 3 |
| forestNames west-african MO | 3 |
| forestNames aztec default | 3 |
| forestNames aztec MO | 3 |
| forestNames maya default | 3 |
| forestNames maya MO | 3 |
| forestNames polynesian default | 3 |
| forestNames polynesian MO | 3 |
| forestNames andean default | 3 |
| forestNames andean MO | 3 |
| moorNames general default | 3 |
| moorNames general MO | 3 |
| moorNames roman default | 3 |
| moorNames roman MO | 3 |
| moorNames greek-byzantine default | 3 |
| moorNames greek-byzantine MO | 3 |
| moorNames slavic default | 3 |
| moorNames slavic MO | 3 |
| moorNames steppe default | 3 |
| moorNames steppe MO | 3 |
| moorNames arabic-persian default | 3 |
| moorNames arabic-persian MO | 3 |
| moorNames indian default | 3 |
| moorNames indian MO | 3 |
| moorNames chinese default | 3 |
| moorNames chinese MO | 3 |
| moorNames japanese default | 3 |
| moorNames japanese MO | 3 |
| moorNames korean default | 3 |
| moorNames korean MO | 3 |
| moorNames egyptian default | 3 |
| moorNames egyptian MO | 3 |
| moorNames ethiopian default | 3 |
| moorNames ethiopian MO | 3 |
| moorNames bantu default | 3 |
| moorNames bantu MO | 3 |
| moorNames west-african default | 3 |
| moorNames west-african MO | 3 |
| moorNames aztec default | 3 |
| moorNames aztec MO | 3 |
| moorNames maya default | 3 |
| moorNames maya MO | 3 |
| moorNames polynesian default | 3 |
| moorNames polynesian MO | 3 |
| moorNames andean default | 3 |
| moorNames andean MO | 3 |
| wetlandNames general default | 3 |
| wetlandNames general MO | 3 |
| wetlandNames roman default | 3 |
| wetlandNames roman MO | 3 |
| wetlandNames greek-byzantine default | 3 |
| wetlandNames greek-byzantine MO | 3 |
| wetlandNames slavic default | 3 |
| wetlandNames slavic MO | 3 |
| wetlandNames steppe default | 3 |
| wetlandNames steppe MO | 3 |
| wetlandNames arabic-persian default | 3 |
| wetlandNames arabic-persian MO | 3 |
| wetlandNames indian default | 3 |
| wetlandNames indian MO | 3 |
| wetlandNames chinese default | 3 |
| wetlandNames chinese MO | 3 |
| wetlandNames japanese default | 3 |
| wetlandNames japanese MO | 3 |
| wetlandNames korean default | 3 |
| wetlandNames korean MO | 3 |
| wetlandNames egyptian default | 3 |
| wetlandNames egyptian MO | 3 |
| wetlandNames ethiopian default | 3 |
| wetlandNames ethiopian MO | 3 |
| wetlandNames bantu default | 3 |
| wetlandNames bantu MO | 3 |
| wetlandNames west-african default | 3 |
| wetlandNames west-african MO | 3 |
| wetlandNames aztec default | 3 |
| wetlandNames aztec MO | 3 |
| wetlandNames maya default | 3 |
| wetlandNames maya MO | 3 |
| wetlandNames polynesian default | 3 |
| wetlandNames polynesian MO | 3 |
| wetlandNames andean default | 3 |
| wetlandNames andean MO | 3 |
| grasslandNames general default | 3 |
| grasslandNames general MO | 3 |
| grasslandNames roman default | 3 |
| grasslandNames roman MO | 3 |
| grasslandNames greek-byzantine default | 3 |
| grasslandNames greek-byzantine MO | 3 |
| grasslandNames slavic default | 3 |
| grasslandNames slavic MO | 3 |
| grasslandNames steppe default | 3 |
| grasslandNames steppe MO | 3 |
| grasslandNames arabic-persian default | 3 |
| grasslandNames arabic-persian MO | 3 |
| grasslandNames indian default | 3 |
| grasslandNames indian MO | 3 |
| grasslandNames chinese default | 3 |
| grasslandNames chinese MO | 3 |
| grasslandNames japanese default | 3 |
| grasslandNames japanese MO | 3 |
| grasslandNames korean default | 3 |
| grasslandNames korean MO | 3 |
| grasslandNames egyptian default | 3 |
| grasslandNames egyptian MO | 3 |
| grasslandNames ethiopian default | 3 |
| grasslandNames ethiopian MO | 3 |
| grasslandNames bantu default | 3 |
| grasslandNames bantu MO | 3 |
| grasslandNames west-african default | 3 |
| grasslandNames west-african MO | 3 |
| grasslandNames aztec default | 3 |
| grasslandNames aztec MO | 3 |
| grasslandNames maya default | 3 |
| grasslandNames maya MO | 3 |
| grasslandNames polynesian default | 3 |
| grasslandNames polynesian MO | 3 |
| grasslandNames andean default | 3 |
| grasslandNames andean MO | 3 |

## place-split-baseline: 1258 states

| State | Seeds changed |
|---|---|
| mountainNames home general default | 3 |
| mountainNames home roman default | 3 |
| mountainNames home greek-byzantine default | 3 |
| mountainNames home slavic default | 3 |
| mountainNames home steppe default | 3 |
| mountainNames home arabic-persian default | 3 |
| mountainNames home indian default | 3 |
| mountainNames home chinese default | 3 |
| mountainNames home japanese default | 3 |
| mountainNames home korean default | 3 |
| mountainNames home egyptian default | 3 |
| mountainNames home ethiopian default | 3 |
| mountainNames home bantu default | 3 |
| mountainNames home west-african default | 3 |
| mountainNames home aztec default | 3 |
| mountainNames home maya default | 3 |
| mountainNames home polynesian default | 3 |
| mountainNames home andean default | 3 |
| forestNames home general default | 3 |
| forestNames home roman default | 3 |
| forestNames home greek-byzantine default | 3 |
| forestNames home slavic default | 3 |
| forestNames home steppe default | 3 |
| forestNames home arabic-persian default | 3 |
| forestNames home indian default | 3 |
| forestNames home chinese default | 3 |
| forestNames home japanese default | 3 |
| forestNames home korean default | 3 |
| forestNames home egyptian default | 3 |
| forestNames home ethiopian default | 3 |
| forestNames home bantu default | 3 |
| forestNames home west-african default | 3 |
| forestNames home aztec default | 3 |
| forestNames home maya default | 3 |
| forestNames home polynesian default | 3 |
| forestNames home andean default | 3 |
| moorNames home general default | 3 |
| moorNames home roman default | 3 |
| moorNames home greek-byzantine default | 3 |
| moorNames home slavic default | 3 |
| moorNames home steppe default | 3 |
| moorNames home arabic-persian default | 3 |
| moorNames home indian default | 3 |
| moorNames home chinese default | 3 |
| moorNames home japanese default | 3 |
| moorNames home korean default | 3 |
| moorNames home egyptian default | 3 |
| moorNames home ethiopian default | 3 |
| moorNames home bantu default | 3 |
| moorNames home west-african default | 3 |
| moorNames home aztec default | 3 |
| moorNames home maya default | 3 |
| moorNames home polynesian default | 3 |
| moorNames home andean default | 3 |
| wetlandNames home general default | 3 |
| wetlandNames home roman default | 3 |
| wetlandNames home greek-byzantine default | 3 |
| wetlandNames home slavic default | 3 |
| wetlandNames home steppe default | 3 |
| wetlandNames home arabic-persian default | 3 |
| wetlandNames home indian default | 3 |
| wetlandNames home chinese default | 3 |
| wetlandNames home japanese default | 3 |
| wetlandNames home korean default | 3 |
| wetlandNames home egyptian default | 3 |
| wetlandNames home ethiopian default | 3 |
| wetlandNames home bantu default | 3 |
| wetlandNames home west-african default | 3 |
| wetlandNames home aztec default | 3 |
| wetlandNames home maya default | 3 |
| wetlandNames home polynesian default | 3 |
| wetlandNames home andean default | 3 |
| grasslandNames home general default | 3 |
| grasslandNames home roman default | 3 |
| grasslandNames home greek-byzantine default | 3 |
| grasslandNames home slavic default | 3 |
| grasslandNames home steppe default | 3 |
| grasslandNames home arabic-persian default | 3 |
| grasslandNames home indian default | 3 |
| grasslandNames home chinese default | 3 |
| grasslandNames home japanese default | 3 |
| grasslandNames home korean default | 3 |
| grasslandNames home egyptian default | 3 |
| grasslandNames home ethiopian default | 3 |
| grasslandNames home bantu default | 3 |
| grasslandNames home west-african default | 3 |
| grasslandNames home aztec default | 3 |
| grasslandNames home maya default | 3 |
| grasslandNames home polynesian default | 3 |
| grasslandNames home andean default | 3 |
| seasLakes home general default | 2 |
| seasLakes home roman default | 3 |
| seasLakes home greek-byzantine default | 3 |
| seasLakes home slavic default | 2 |
| seasLakes home steppe default | 2 |
| seasLakes home arabic-persian default | 3 |
| seasLakes home indian default | 3 |
| seasLakes home chinese default | 2 |
| seasLakes home japanese default | 2 |
| seasLakes home korean default | 2 |
| seasLakes home egyptian default | 3 |
| seasLakes home ethiopian default | 3 |
| seasLakes home bantu default | 3 |
| seasLakes home west-african default | 2 |
| seasLakes home aztec default | 2 |
| seasLakes home maya default | 2 |
| seasLakes home polynesian default | 3 |
| seasLakes home andean default | 2 |
| coastsIslands home general default | 3 |
| coastsIslands home roman default | 3 |
| coastsIslands home greek-byzantine default | 3 |
| coastsIslands home slavic default | 3 |
| coastsIslands home steppe default | 3 |
| coastsIslands home arabic-persian default | 3 |
| coastsIslands home indian default | 3 |
| coastsIslands home chinese default | 3 |
| coastsIslands home japanese default | 3 |
| coastsIslands home korean default | 3 |
| coastsIslands home egyptian default | 3 |
| coastsIslands home ethiopian default | 3 |
| coastsIslands home bantu default | 3 |
| coastsIslands home west-african default | 3 |
| coastsIslands home aztec default | 3 |
| coastsIslands home maya default | 3 |
| coastsIslands home polynesian default | 3 |
| coastsIslands home andean default | 3 |
| seaCharts home general default | 3 |
| seaCharts home roman default | 3 |
| seaCharts home greek-byzantine default | 3 |
| seaCharts home slavic default | 2 |
| seaCharts home steppe default | 3 |
| seaCharts home arabic-persian default | 3 |
| seaCharts home indian default | 2 |
| seaCharts home chinese default | 3 |
| seaCharts home japanese default | 2 |
| seaCharts home korean default | 2 |
| seaCharts home egyptian default | 2 |
| seaCharts home ethiopian default | 3 |
| seaCharts home bantu default | 3 |
| seaCharts home west-african default | 3 |
| seaCharts home aztec default | 3 |
| seaCharts home maya default | 3 |
| seaCharts home polynesian default | 3 |
| seaCharts home andean default | 3 |
| mountainNames new general default | 3 |
| mountainNames new roman default | 3 |
| mountainNames new greek-byzantine default | 3 |
| mountainNames new slavic default | 3 |
| mountainNames new steppe default | 3 |
| mountainNames new arabic-persian default | 3 |
| mountainNames new indian default | 3 |
| mountainNames new chinese default | 3 |
| mountainNames new japanese default | 3 |
| mountainNames new korean default | 3 |
| mountainNames new egyptian default | 3 |
| mountainNames new ethiopian default | 3 |
| mountainNames new bantu default | 3 |
| mountainNames new west-african default | 3 |
| mountainNames new aztec default | 3 |
| mountainNames new maya default | 3 |
| mountainNames new polynesian default | 3 |
| mountainNames new andean default | 3 |
| forestNames new general default | 3 |
| forestNames new roman default | 3 |
| forestNames new greek-byzantine default | 3 |
| forestNames new slavic default | 3 |
| forestNames new steppe default | 3 |
| forestNames new arabic-persian default | 3 |
| forestNames new indian default | 3 |
| forestNames new chinese default | 3 |
| forestNames new japanese default | 3 |
| forestNames new korean default | 3 |
| forestNames new egyptian default | 3 |
| forestNames new ethiopian default | 3 |
| forestNames new bantu default | 3 |
| forestNames new west-african default | 3 |
| forestNames new aztec default | 3 |
| forestNames new maya default | 3 |
| forestNames new polynesian default | 3 |
| forestNames new andean default | 3 |
| moorNames new general default | 3 |
| moorNames new roman default | 3 |
| moorNames new greek-byzantine default | 3 |
| moorNames new slavic default | 3 |
| moorNames new steppe default | 3 |
| moorNames new arabic-persian default | 3 |
| moorNames new indian default | 3 |
| moorNames new chinese default | 3 |
| moorNames new japanese default | 3 |
| moorNames new korean default | 3 |
| moorNames new egyptian default | 3 |
| moorNames new ethiopian default | 3 |
| moorNames new bantu default | 3 |
| moorNames new west-african default | 3 |
| moorNames new aztec default | 3 |
| moorNames new maya default | 3 |
| moorNames new polynesian default | 3 |
| moorNames new andean default | 3 |
| wetlandNames new general default | 3 |
| wetlandNames new roman default | 3 |
| wetlandNames new greek-byzantine default | 3 |
| wetlandNames new slavic default | 3 |
| wetlandNames new steppe default | 3 |
| wetlandNames new arabic-persian default | 3 |
| wetlandNames new indian default | 3 |
| wetlandNames new chinese default | 3 |
| wetlandNames new japanese default | 3 |
| wetlandNames new korean default | 3 |
| wetlandNames new egyptian default | 3 |
| wetlandNames new ethiopian default | 3 |
| wetlandNames new bantu default | 3 |
| wetlandNames new west-african default | 3 |
| wetlandNames new aztec default | 3 |
| wetlandNames new maya default | 3 |
| wetlandNames new polynesian default | 3 |
| wetlandNames new andean default | 3 |
| grasslandNames new general default | 3 |
| grasslandNames new roman default | 3 |
| grasslandNames new greek-byzantine default | 3 |
| grasslandNames new slavic default | 3 |
| grasslandNames new steppe default | 3 |
| grasslandNames new arabic-persian default | 3 |
| grasslandNames new indian default | 3 |
| grasslandNames new chinese default | 3 |
| grasslandNames new japanese default | 3 |
| grasslandNames new korean default | 3 |
| grasslandNames new egyptian default | 3 |
| grasslandNames new ethiopian default | 3 |
| grasslandNames new bantu default | 3 |
| grasslandNames new west-african default | 3 |
| grasslandNames new aztec default | 3 |
| grasslandNames new maya default | 3 |
| grasslandNames new polynesian default | 3 |
| grasslandNames new andean default | 3 |
| seasLakes new general default | 3 |
| seasLakes new roman default | 3 |
| seasLakes new greek-byzantine default | 3 |
| seasLakes new slavic default | 3 |
| seasLakes new steppe default | 2 |
| seasLakes new arabic-persian default | 3 |
| seasLakes new indian default | 3 |
| seasLakes new chinese default | 1 |
| seasLakes new japanese default | 2 |
| seasLakes new korean default | 2 |
| seasLakes new egyptian default | 3 |
| seasLakes new ethiopian default | 3 |
| seasLakes new bantu default | 3 |
| seasLakes new west-african default | 2 |
| seasLakes new aztec default | 2 |
| seasLakes new maya default | 2 |
| seasLakes new polynesian default | 3 |
| seasLakes new andean default | 2 |
| coastsIslands new general default | 3 |
| coastsIslands new roman default | 3 |
| coastsIslands new greek-byzantine default | 3 |
| coastsIslands new slavic default | 3 |
| coastsIslands new steppe default | 3 |
| coastsIslands new arabic-persian default | 3 |
| coastsIslands new indian default | 3 |
| coastsIslands new chinese default | 3 |
| coastsIslands new japanese default | 3 |
| coastsIslands new korean default | 3 |
| coastsIslands new egyptian default | 3 |
| coastsIslands new ethiopian default | 3 |
| coastsIslands new bantu default | 3 |
| coastsIslands new west-african default | 3 |
| coastsIslands new aztec default | 3 |
| coastsIslands new maya default | 3 |
| coastsIslands new polynesian default | 3 |
| coastsIslands new andean default | 3 |
| seaCharts new general default | 3 |
| seaCharts new roman default | 3 |
| seaCharts new greek-byzantine default | 3 |
| seaCharts new slavic default | 2 |
| seaCharts new steppe default | 3 |
| seaCharts new arabic-persian default | 3 |
| seaCharts new indian default | 3 |
| seaCharts new chinese default | 3 |
| seaCharts new japanese default | 2 |
| seaCharts new korean default | 3 |
| seaCharts new egyptian default | 2 |
| seaCharts new ethiopian default | 3 |
| seaCharts new bantu default | 3 |
| seaCharts new west-african default | 3 |
| seaCharts new aztec default | 3 |
| seaCharts new maya default | 3 |
| seaCharts new polynesian default | 3 |
| seaCharts new andean default | 3 |
| mountainNames settled general default | 3 |
| mountainNames settled roman default | 3 |
| mountainNames settled greek-byzantine default | 3 |
| mountainNames settled slavic default | 3 |
| mountainNames settled steppe default | 3 |
| mountainNames settled arabic-persian default | 3 |
| mountainNames settled indian default | 3 |
| mountainNames settled chinese default | 3 |
| mountainNames settled japanese default | 3 |
| mountainNames settled korean default | 3 |
| mountainNames settled egyptian default | 3 |
| mountainNames settled ethiopian default | 3 |
| mountainNames settled bantu default | 3 |
| mountainNames settled west-african default | 3 |
| mountainNames settled aztec default | 3 |
| mountainNames settled maya default | 3 |
| mountainNames settled polynesian default | 3 |
| mountainNames settled andean default | 3 |
| forestNames settled general default | 3 |
| forestNames settled roman default | 3 |
| forestNames settled greek-byzantine default | 3 |
| forestNames settled slavic default | 3 |
| forestNames settled steppe default | 3 |
| forestNames settled arabic-persian default | 3 |
| forestNames settled indian default | 3 |
| forestNames settled chinese default | 3 |
| forestNames settled japanese default | 3 |
| forestNames settled korean default | 3 |
| forestNames settled egyptian default | 3 |
| forestNames settled ethiopian default | 3 |
| forestNames settled bantu default | 3 |
| forestNames settled west-african default | 3 |
| forestNames settled aztec default | 3 |
| forestNames settled maya default | 3 |
| forestNames settled polynesian default | 3 |
| forestNames settled andean default | 3 |
| moorNames settled general default | 3 |
| moorNames settled roman default | 3 |
| moorNames settled greek-byzantine default | 3 |
| moorNames settled slavic default | 3 |
| moorNames settled steppe default | 3 |
| moorNames settled arabic-persian default | 3 |
| moorNames settled indian default | 3 |
| moorNames settled chinese default | 3 |
| moorNames settled japanese default | 3 |
| moorNames settled korean default | 3 |
| moorNames settled egyptian default | 3 |
| moorNames settled ethiopian default | 3 |
| moorNames settled bantu default | 3 |
| moorNames settled west-african default | 3 |
| moorNames settled aztec default | 3 |
| moorNames settled maya default | 3 |
| moorNames settled polynesian default | 3 |
| moorNames settled andean default | 3 |
| wetlandNames settled general default | 3 |
| wetlandNames settled roman default | 3 |
| wetlandNames settled greek-byzantine default | 3 |
| wetlandNames settled slavic default | 3 |
| wetlandNames settled steppe default | 3 |
| wetlandNames settled arabic-persian default | 3 |
| wetlandNames settled indian default | 3 |
| wetlandNames settled chinese default | 3 |
| wetlandNames settled japanese default | 3 |
| wetlandNames settled korean default | 3 |
| wetlandNames settled egyptian default | 3 |
| wetlandNames settled ethiopian default | 3 |
| wetlandNames settled bantu default | 3 |
| wetlandNames settled west-african default | 3 |
| wetlandNames settled aztec default | 3 |
| wetlandNames settled maya default | 3 |
| wetlandNames settled polynesian default | 3 |
| wetlandNames settled andean default | 3 |
| grasslandNames settled general default | 3 |
| grasslandNames settled roman default | 3 |
| grasslandNames settled greek-byzantine default | 3 |
| grasslandNames settled slavic default | 3 |
| grasslandNames settled steppe default | 3 |
| grasslandNames settled arabic-persian default | 3 |
| grasslandNames settled indian default | 3 |
| grasslandNames settled chinese default | 3 |
| grasslandNames settled japanese default | 3 |
| grasslandNames settled korean default | 3 |
| grasslandNames settled egyptian default | 3 |
| grasslandNames settled ethiopian default | 3 |
| grasslandNames settled bantu default | 3 |
| grasslandNames settled west-african default | 3 |
| grasslandNames settled aztec default | 3 |
| grasslandNames settled maya default | 3 |
| grasslandNames settled polynesian default | 3 |
| grasslandNames settled andean default | 3 |
| seasLakes settled general default | 3 |
| seasLakes settled roman default | 3 |
| seasLakes settled greek-byzantine default | 3 |
| seasLakes settled slavic default | 3 |
| seasLakes settled steppe default | 2 |
| seasLakes settled arabic-persian default | 3 |
| seasLakes settled indian default | 3 |
| seasLakes settled chinese default | 1 |
| seasLakes settled japanese default | 2 |
| seasLakes settled korean default | 2 |
| seasLakes settled egyptian default | 3 |
| seasLakes settled ethiopian default | 3 |
| seasLakes settled bantu default | 3 |
| seasLakes settled west-african default | 2 |
| seasLakes settled aztec default | 2 |
| seasLakes settled maya default | 2 |
| seasLakes settled polynesian default | 3 |
| seasLakes settled andean default | 2 |
| coastsIslands settled general default | 3 |
| coastsIslands settled roman default | 3 |
| coastsIslands settled greek-byzantine default | 3 |
| coastsIslands settled slavic default | 3 |
| coastsIslands settled steppe default | 3 |
| coastsIslands settled arabic-persian default | 3 |
| coastsIslands settled indian default | 3 |
| coastsIslands settled chinese default | 3 |
| coastsIslands settled japanese default | 3 |
| coastsIslands settled korean default | 3 |
| coastsIslands settled egyptian default | 3 |
| coastsIslands settled ethiopian default | 3 |
| coastsIslands settled bantu default | 3 |
| coastsIslands settled west-african default | 3 |
| coastsIslands settled aztec default | 3 |
| coastsIslands settled maya default | 3 |
| coastsIslands settled polynesian default | 3 |
| coastsIslands settled andean default | 3 |
| seaCharts settled general default | 3 |
| seaCharts settled roman default | 3 |
| seaCharts settled greek-byzantine default | 3 |
| seaCharts settled slavic default | 3 |
| seaCharts settled steppe default | 3 |
| seaCharts settled arabic-persian default | 3 |
| seaCharts settled indian default | 3 |
| seaCharts settled chinese default | 3 |
| seaCharts settled japanese default | 2 |
| seaCharts settled korean default | 3 |
| seaCharts settled egyptian default | 2 |
| seaCharts settled ethiopian default | 3 |
| seaCharts settled bantu default | 3 |
| seaCharts settled west-african default | 3 |
| seaCharts settled aztec default | 3 |
| seaCharts settled maya default | 3 |
| seaCharts settled polynesian default | 3 |
| seaCharts settled andean default | 3 |

## wizard-retirement-baseline: 267 states

| State | Seeds changed |
|---|---|
| waters seasLakes default | 3 |
| waters seasLakes temperate | 3 |
| waters seasLakes moorland | 3 |
| waters seasLakes boreal | 3 |
| waters seasLakes cool-rainforest | 3 |
| waters seasLakes mediterranean | 3 |
| waters seasLakes steppe | 3 |
| waters seasLakes desert | 3 |
| waters seasLakes savannah | 3 |
| waters seasLakes rainforest | 3 |
| waters seasLakes monsoon | 3 |
| waters seasLakes tropical-islands | 3 |
| waters seasLakes highland | 3 |
| waters coastsIslands default | 3 |
| waters coastsIslands temperate | 3 |
| waters coastsIslands moorland | 3 |
| waters coastsIslands boreal | 3 |
| waters coastsIslands cool-rainforest | 3 |
| waters coastsIslands mediterranean | 3 |
| waters coastsIslands steppe | 3 |
| waters coastsIslands desert | 3 |
| waters coastsIslands savannah | 3 |
| waters coastsIslands rainforest | 3 |
| waters coastsIslands monsoon | 3 |
| waters coastsIslands tropical-islands | 3 |
| waters coastsIslands highland | 3 |
| waters seaCharts default | 3 |
| waters seaCharts temperate | 3 |
| waters seaCharts moorland | 3 |
| waters seaCharts boreal | 3 |
| waters seaCharts cool-rainforest | 3 |
| waters seaCharts mediterranean | 3 |
| waters seaCharts steppe | 3 |
| waters seaCharts desert | 3 |
| waters seaCharts savannah | 3 |
| waters seaCharts rainforest | 3 |
| waters seaCharts monsoon | 3 |
| waters seaCharts tropical-islands | 3 |
| waters seaCharts highland | 3 |
| wilds mountainNames default | 3 |
| wilds mountainNames temperate | 3 |
| wilds mountainNames moorland | 3 |
| wilds mountainNames boreal | 3 |
| wilds mountainNames cool-rainforest | 3 |
| wilds mountainNames mediterranean | 3 |
| wilds mountainNames steppe | 3 |
| wilds mountainNames desert | 3 |
| wilds mountainNames savannah | 3 |
| wilds mountainNames rainforest | 3 |
| wilds mountainNames monsoon | 3 |
| wilds mountainNames tropical-islands | 3 |
| wilds mountainNames highland | 3 |
| wilds forestNames default | 3 |
| wilds forestNames temperate | 3 |
| wilds forestNames moorland | 3 |
| wilds forestNames boreal | 3 |
| wilds forestNames cool-rainforest | 3 |
| wilds forestNames mediterranean | 3 |
| wilds forestNames steppe | 3 |
| wilds forestNames savannah | 3 |
| wilds forestNames rainforest | 3 |
| wilds forestNames monsoon | 3 |
| wilds forestNames tropical-islands | 3 |
| wilds forestNames highland | 3 |
| wilds moorNames default | 3 |
| wilds moorNames moorland | 3 |
| wilds moorNames temperate | 3 |
| wilds moorNames boreal | 3 |
| wilds moorNames highland | 3 |
| wilds moorNames cool-rainforest | 3 |
| wilds wetlandNames default | 3 |
| wilds wetlandNames temperate | 3 |
| wilds wetlandNames moorland | 3 |
| wilds wetlandNames boreal | 3 |
| wilds wetlandNames cool-rainforest | 3 |
| wilds wetlandNames mediterranean | 3 |
| wilds wetlandNames steppe | 3 |
| wilds wetlandNames savannah | 3 |
| wilds wetlandNames rainforest | 3 |
| wilds wetlandNames monsoon | 3 |
| wilds wetlandNames tropical-islands | 3 |
| wilds wetlandNames highland | 3 |
| wilds grasslandNames default | 3 |
| wilds grasslandNames temperate | 3 |
| wilds grasslandNames steppe | 3 |
| wilds grasslandNames savannah | 3 |
| wilds grasslandNames mediterranean | 3 |
| wilds grasslandNames highland | 3 |
| wilds grasslandNames monsoon | 3 |
