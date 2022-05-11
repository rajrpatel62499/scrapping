import re
import pandas as pd
import requests
from PIL import Image
import time
from selenium import webdriver

options1 = webdriver.ChromeOptions()
options1.add_argument("start-maximized") #// open Browser in maximized mode
options1.add_argument("disable-infobars") 
options1.add_argument("--disable-extensions") 
options1.add_argument("--disable-gpu")
options1.add_argument("--disable-dev-shm-usage")
options1.add_argument("--no-sandbox")

## chrome driver for the specific version of chrome currently being used in the system needs to be downloaded
chrome_driver = webdriver.Chrome("C://D//projects//jackett//scrapping//chromedriver.exe", chrome_options=options1)


chrome_driver.get("https://examsnet.com/test/physical-world-and-measurements/")

time.sleep(4)

element = chrome_driver.find_element_by_id('question')
print(element.text)
location = element.location

question_element = chrome_driver.find_element_by_id('mquestion')
size = question_element.size

print(location)
print(size)

chrome_driver.execute_script("window.scrollTo(" +str(location['x']) + "," + str(location['y'])+ ")")
chrome_driver.save_screenshot("pageImage.png")

width = location['x']+size['width']
height = location['y']+size['height']

im = Image.open('pageImage.png')
im_cropped = im.crop((20+int(location['x']), 40, int(width)+int(width)/4, int(size['height'])+int(height)/4))
im.save('element.png')
im_cropped.show()