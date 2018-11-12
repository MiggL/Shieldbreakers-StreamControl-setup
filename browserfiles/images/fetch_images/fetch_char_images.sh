folder="../smash_ultimate"
mkdir $folder
while read -r filename url;
do
  wget https://www.ssbwiki.com${url} -O ${folder}/${filename}
done <char_img_to_url.txt
