folder="../smash_ultimate"
mkdir $folder
while read -r filename url;
do
  wget https://www.ssbwiki.com${url} -O ${folder}/${filename}
  #echo ",,${filename}" | cut -d'.' -f 1 >> ../../../players.csv    #use this for autocompletion of characters in SC
done <char_img_to_url.txt
