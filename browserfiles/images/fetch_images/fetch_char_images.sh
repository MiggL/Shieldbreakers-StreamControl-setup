folder="../smash_ultimate"
mkdir $folder
while read -r filename url;
do
  wget https://www.ssbwiki.com${url} -O ${filename}
  convert ${filename} -crop 100x100 -scene 1 ${folder}/${filename:0:-4}%d.png
  rm ${filename}
  echo ",,${filename:0:-4}" >> ../../../players.csv    #use this for autocompletion of characters in SC
done <char_img_to_url.txt
