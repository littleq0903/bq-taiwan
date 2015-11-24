bg-taiwan
=========

BigQuery Taiwan is a visualization tool that allows you to query Taiwan location-based data via BigQuery API and visualize it.

Demo Link: [Demo](http://littleq0903.github.io/bq-taiwan/)

screenshots
===========

```sql
SELECT _f2,AVG(FLOAT(_f4)) FROM [samples.cancer_data_noheader] GROUP BY _f2 LIMIT 1000;
```

![filehelper_1448364095560_31](https://cloud.githubusercontent.com/assets/374786/11365396/162c3758-92e1-11e5-9efa-23831412379b.png)

```sql
-- geometrical distribution of cancer in 2010's Taiwan
SELECT _f2,AVG(FLOAT(_f4)) as f4 FROM samples.cancer_data_noheader WHERE _f0 = "2010" GROUP BY _f2 ORDER BY f4 LIMIT 25;
```

![filehelper_1448364095587_61](https://cloud.githubusercontent.com/assets/374786/11365395/15223df8-92e1-11e5-8687-8cf3a23a133a.png)
