from __future__ import unicode_literals
from django.utils.text import slugify
import django.utils.timezone as timezone
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch.dispatcher import receiver
from login.models import User
from datetime import date, datetime
from django.db import models
from itertools import groupby
from PIL import Image as PILImage
import os, re

# Para extraer contenido de las noticias externas
from bs4 import BeautifulSoup
import requests

# Create your models here.
class Section(models.Model):
	spanish_name = models.CharField(max_length=50, unique=True, null=False)
	english_name = models.CharField(max_length=50, unique=True, null=False)
	slug = models.SlugField(max_length=20, unique=True, null=False)
	spanish_title = models.CharField(max_length=200, default="<h1 class='c12'></h1>")
	spanish_body = models.TextField(default="<p></p>")
	english_title = models.CharField(max_length=200, default="<h1 class='c12'></h1>")
	english_body = models.TextField(default="<p></p>")
	header = models.FileField(upload_to='static/webpage/images/sections/header/', max_length=500, null=True)

	def save(self, *args, **kwargs):
		if not self.id:
			if not self.slug:
				self.slug = slugify(self.name)
			if not self.english_name:
				self.english_name = self.spanish_name
			if not self.english_title:
				self.english_title = self.spanish_title
			if not self.english_body:
				self.english_body = self.spanish_body

		super(Section, self).save(*args, **kwargs)

	def update_header(self, image):
		# Si existe una foto, se elimina
		if self.header:
			os.remove(self.header.path)
			self.save()

		self.header.save('SH' + str(self.id) + '.jpg', image)
		self.save()
		return True

	def header_url(self):
		return 'webpage/images/sections/header/' + os.path.basename(self.header.name)

	def header_static_url(self):
		return settings.SECTION_HEADERS_STATIC_URL + os.path.basename(self.header.name)

	def get_categories(self):
		return SubSectionCategory.objects.filter(section=self)


class SubSectionCategory(models.Model):
	spanish_name = models.CharField(max_length=50, null=False)
	english_name = models.CharField(max_length=50, null=False)
	section = models.ForeignKey(Section, on_delete=models.CASCADE)
	image = models.FileField(upload_to='static/webpage/images/sections/thumbnail/', max_length=500, null=True)

	def save(self, *args, **kwargs):
		if not self.id:
			if not self.english_name:
				self.english_name = self.spanish_name

		super(SubSectionCategory, self).save(*args, **kwargs)

	def get_subsections(self):
		return SubSection.objects.filter(category=self)

	def update_image(self, image):
		# Si existe una foto, se elimina
		if self.image:
			os.remove(self.image.path)
			self.save()

		self.image.save('CI' + str(self.id) + '.jpg', image)
		self.save()
		return True

	def image_url(self):
		return 'webpage/images/sections/thumbnail/' + os.path.basename(self.image.name)

	def image_static_url(self):
		return settings.SECTION_THUMBNAILS_STATIC_URL + os.path.basename(self.image.name)


class SubSection(models.Model):
	spanish_name = models.CharField(max_length=80, null=False)
	english_name = models.CharField(max_length=80, null=False)
	slug = models.SlugField(max_length=30, unique=True, null=False)
	spanish_title = models.CharField(max_length=200, default="<h1 class='c12'></h1>")
	spanish_body = models.TextField(default="<p></p>")
	english_title = models.CharField(max_length=200, default="<h1 class='c12'></h1>")
	english_body = models.TextField(default="<p></p>")
	category = models.ForeignKey(SubSectionCategory, on_delete=models.CASCADE)

	def save(self, *args, **kwargs):
		if not self.id:
			if not self.english_name:
				self.english_name = self.spanish_name
			if not self.slug:
				self.slug = slugify(self.english_name)
			if not self.english_title:
				self.english_title = self.spanish_title
			if not self.english_body:
				self.english_body = self.spanish_body

		super(SubSection, self).save(*args, **kwargs)


class News(models.Model):
	title = models.CharField(max_length=200, null=True)
	title_html = models.CharField(max_length=200, null=True)
	slug = models.SlugField(max_length=200, null=True)
	body = models.TextField()
	description = models.TextField(null=True)
	date = models.DateField(null=True, default=date.today)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	source_text = models.CharField(max_length=200, null=True)
	source_url = models.CharField(max_length=200, null=True)
	is_published = models.BooleanField(default=False)
	admin_annotation = models.CharField(max_length=200, null=True)
	thumbnail = models.FileField(upload_to='static/webpage/images/news/thumbnail/', max_length=500, null=True)
	header = models.FileField(upload_to='static/webpage/images/news/header/', max_length=500, null=True)
	in_header = models.BooleanField(default=False)
	is_external = models.BooleanField(default=False)

	def save(self, *args, **kwargs):
		slug = slugify(self.title)
		news = News.objects.filter(date=self.date, title=self.title).exclude(id=self.id)
		count = 0
		# Si existe una noticia con el mismo nombre
		# Se agrega un numero al final del slug
		if news:
			while True:
				count += 1
				slug_temp = slug + '-' + str(count)
				if not News.objects.filter(date=self.date, slug=slug_temp).exclude(id=self.id):
					break
			slug += '-' + str(count)
		self.slug = slug

		# http://stackoverflow.com/questions/11092192/extracting-values-from-meta-tags-and-img-url-having-only-url-of-website-written
		if self.source_url and self.is_external:
			soup = BeautifulSoup(requests.get(self.source_url).content, "html")
			meta = soup.find_all('meta')
			for tag in meta:
				if 'name' in tag.attrs and tag.attrs['name'].lower() in ['description']:
					setattr(self, tag.attrs['name'].lower(), tag.attrs['content'])

		super(News, self).save(*args, **kwargs)

	def set_header_filename(self):
		filename = settings.NEWS_HEADERS_DIR + 'NH' + str(self.id) + '.jpg'
		os.rename(self.header.path, filename)
		self.header = filename
		self.save()
		header = PILImage.open(self.header.path)
		exif = header.info.get('exif', '')
		header.save(filename, exif=exif, quality=70)
		header.close()

	def set_thumbnail_filename(self):
		filename = settings.NEWS_THUMBNAILS_DIR + 'NT' + str(self.id) + '.jpg'
		os.rename(self.thumbnail.path, filename)
		self.thumbnail.name = filename
		self.save()
		thumbnail = PILImage.open(self.thumbnail.path)
		exif = thumbnail.info.get('exif', '')
		thumbnail.save(filename, exif=exif, quality=70)
		thumbnail.close()

	def thumbnail_url(self):
		return 'webpage/images/news/thumbnail/' + os.path.basename(self.thumbnail.name)

	def header_url(self):
		return 'webpage/images/news/header/' + os.path.basename(self.header.name)

	def update_thumbnail(self, picture):
		# Si existe una foto, se elimina
		if self.thumbnail:
			os.remove(self.thumbnail.path)
			self.save()

		self.thumbnail.save('NT' + str(self.id) + '.jpg', picture)
		self.save()
		thumbnail = PILImage.open(self.thumbnail.path)
		exif = thumbnail.info.get('exif', '')
		thumbnail.save(self.thumbnail.path, exif=exif, quality=70)
		thumbnail.close()
		return True

	def update_header(self, picture):
		# Si existe una foto, se elimina
		if self.header:
			os.remove(self.header.path)
			self.save()

		self.header.save('NH' + str(self.id) + '.jpg', picture)
		self.save()

		# Se baja la calidad
		header = PILImage.open(self.header.path)
		exif = header.info.get('exif', '')
		header.save(self.header.path, exif=exif, quality=70)
		header.close()
		return True

	def get_comments(self):
		return News_comment.objects.filter(news=self)

	# Si hay un comentario sin leer, retorna la id del comentario
	def user_has_unseen_comments(self):
		comment = News_comment.objects.filter(news=self, author__is_admin=True).latest('id')
		if not comment.seen:
			return comment.id
		return False

	def admin_has_unseen_comments(self):
		comment = News_comment.objects.filter(news=self, author__is_admin=False).latest('id')
		if not comment.seen:
			return comment.id
		return False

	# Actualiza los mensajes leidos
	def read_comments(self, user):
		comments = News_comment.objects.filter(news=self).exclude(author=user).update(seen=True)

	def get_extract(self):
		reg = re.compile(r'<p>\n*\s*(.*)\s*\n*<\/p>')
		text = reg.findall(self.body)
		if text:
			text = re.sub(r'<.>|<\/.>', '', text[0])
			text_split = text.split()
			n = 50
			sub = []
			if n < len(text_split):
				for i in range(0, n):
					sub.append(text_split[i])
				text = ' '.join(sub) + ' (...)'
			return text

		return ''


class News_comment(models.Model):
	news = models.ForeignKey(News, on_delete=models.CASCADE, null=False)
	author = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
	content = models.CharField(max_length=500, null=False)
	date = models.DateTimeField(auto_now=True)
	seen = models.BooleanField(default=False)


class Image(models.Model):
	picture = models.FileField(upload_to='static/webpage/images/news/', max_length=500, null=True)
	news = models.ForeignKey(News, on_delete=models.CASCADE)

	def static_url(self):
		return settings.NEWS_PICTURES_STATIC_URL + os.path.basename(self.picture.name)

	def set_filename(self):
		filename =  settings.NEWS_PICTURES_DIR + 'N' + str(self.news.id) + 'P' + str(self.id) + '.jpg'
		os.rename(self.picture.path, filename)
		self.picture.name = filename
		self.save()


class SectionImage(models.Model):
	image = models.FileField(upload_to='static/webpage/images/sections/', max_length=500, null=True)
	section = models.ForeignKey(Section, on_delete=models.CASCADE)

	def static_url(self):
		return settings.SECTION_IMAGES_STATIC_URL + os.path.basename(self.image.name)

	def set_filename(self):
		filename = settings.SECTION_IMAGES_DIR + 'S' + str(self.section.id) + 'I' + str(self.id) + '.jpg'

		img = PILImage.open(self.image.path)
		exif = img.info.get('exif', '')
		img.save(filename, exif=exif, quality=70)
		img.close()

		os.remove(self.image.path)
		self.image = filename
		self.save()


class GalleryPhoto(models.Model):
	image = models.FileField(upload_to='static/webpage/images/gallery/', max_length=500, null=True)

	def image_static_url(self):
		return settings.GALLERY_IMAGES_STATIC_URL + os.path.basename(self.image.name)

	def set_image_filename(self):
		filename = settings.GALLERY_IMAGES_DIR + 'GI' + str(self.id) + '.jpg'

		img = PILImage.open(self.image.path)
		exif = img.info.get('exif', '')
		img.save(filename, exif=exif, quality=80)
		img.close()

		os.remove(self.image.path)
		self.image = filename
		self.save()


class Member(models.Model):
	name = models.CharField(max_length=150, unique=True)
	description = models.TextField()
	working = models.BooleanField(default=True)
	image = models.FileField(upload_to='static/webpage/images/members/', max_length=500, null=True)


	def set_image_filename(self):
		filename_h = settings.MEMBERS_IMAGES_DIR + 'I' + str(self.id) + '.jpg'
		os.rename(self.image.path, filename_h)
		self.image.name = filename_h
		self.save()

	def image_url(self):
		return 'webpage/images/members/' + os.path.basename(self.image.name)

	def update_picture(self, picture):
		# Si existe una foto, se elimina
		if self.image:
			os.remove(self.image.path)
			self.save()

		self.image.save('I' + str(self.id) + '.jpg', picture)
		self.save()
		return True


class Event(models.Model):
	title = models.CharField(max_length=200)
	slug = models.SlugField(max_length=200)
	description = models.CharField(max_length=700)
	image = models.FileField(upload_to='static/webpage/images/events/', max_length=500, null=True)
	program = models.FileField(upload_to='static/webpage/files/events/', max_length=500, null=True)

	def save(self, *args, **kwargs):
		self.slug = slugify(self.title)
		super(Event, self).save(*args, **kwargs)

	def exists_event_with_slug(self, slug):
		exists = False
		events = Event.objects.filter(slug=slug).exclude(id=self.id)
		for event in events:
			if event.get_date() == self.get_date():
				exists = True
				break

		return exists

	def check_slug(self):
		slug = self.slug

		count = 0
		# Si existe un evento con el mismo nombre
		# Se agrega un numero al final del slug
		if self.exists_event_with_slug(slug):
			while True:
				count += 1
				slug_temp = slug + '-' + str(count)
				if not self.exists_event_with_slug(slug_temp):
					break
			slug += '-' + str(count)

		self.slug = slug
		self.save()

	def get_date(self):
		event_day = self.get_days().first()

		if event_day:
			return datetime.combine(event_day.day, event_day.begin_hour)

	def get_dates(self):
		dates = EventDay.objects.filter(event=self).values_list('day', flat=True).order_by('day').distinct()

		if dates:
			return [list(g) for t, g in groupby(dates, key=lambda date: (date.month, date.year))]

	def get_days(self):
		return EventDay.objects.filter(event=self).order_by('day', 'begin_hour')

	def image_name(self):
		return os.path.basename(self.image.name)

	def program_name(self):
		return os.path.basename(self.program.name)

	def image_static_url(self):
		return settings.EVENT_IMAGES_STATIC_URL + os.path.basename(self.image.name)

	def program_static_url(self):
		return settings.EVENT_PROGRAMS_STATIC_URL + os.path.basename(self.program.name)

	def set_image_filename(self):
		filename_i = settings.EVENTS_IMAGES_DIR + 'EI' + str(self.id) + '.jpg'
		os.rename(self.image.path, filename_i)
		self.image.name = filename_i
		self.save()

	def set_program_filename(self):
		filename_p = settings.EVENTS_PROGRAMS_DIR + 'EP' + str(self.id) + '.pdf'
		os.rename(self.program.path, filename_p)
		self.program.name = filename_p
		self.save()

	def update_image(self, image):
		# Si existe una foto, se elimina
		if self.image:
			os.remove(self.image.path)
			self.save()

		self.image.save('EI' + str(self.id) + '.jpg', image)
		self.save()
		return True

	def update_program(self, program):
		# Si existe un archivo, se elimina
		if self.program:
			os.remove(self.program.path)
			self.save()

		self.program.save('EP' + str(self.id) + '.pdf', program)
		self.save()
		return True

	def add_event_days(self, days):
		from webpage.forms import EventDayForm

		for day in days:
			day['event'] = self.id
			form = EventDayForm(day)
			if form.is_valid():
				try:
					form.save()
				except Exception as e:
					print e.message
					return e.message
			else:
				print form.errors
				return form.errors

	def update_event_days(self, days):
		for day in days:
			id = day.get('id', None)
			if id is not None:
				event_day = EventDay.objects.filter(id=id, event=self).first()
				if event_day:
					if day['day'] is not None:
						event_day.day = datetime.strptime(day['day'], "%d-%m-%Y").date()

					if day['begin_hour'] is not None:
						event_day.begin_hour = day['begin_hour']

					if day['end_hour'] is not None:
						event_day.end_hour = day['end_hour']

					if day['location'] is not None:
						event_day.location = day['location']

					try:
						event_day.save()
					except Exception as e:
						print e.message

			else:
				result = self.add_event_days([day])
				if result:
					return result

	def remove_event_days(self, days):
		for id in days:
			event_day = EventDay.objects.filter(id=id, event=self).first()
			if event_day:
				event_day.delete()

	def image_url(self):
		return 'webpage/images/events/' + os.path.basename(self.image.name)

	def program_url(self):
		return 'webpage/files/events/' + os.path.basename(self.program.name)


class EventDay(models.Model):
	day = models.DateField(default=date.today)
	begin_hour = models.TimeField(default=timezone.now)
	end_hour = models.TimeField(default=timezone.now)
	location = models.CharField(max_length=100)
	event = models.ForeignKey(Event, on_delete=models.CASCADE)

# Se eliminan las imagenes del directorio
# http://stackoverflow.com/questions/5372934/how-do-i-get-django-admin-to-delete-files-when-i-remove-an-object-from-the-datab
@receiver(post_delete, sender=News)
def news_delete(sender, instance, **kwargs):
	instance.header.delete(False)
	instance.thumbnail.delete(False)
@receiver(post_delete, sender=Image)
def image_delete(sender, instance, **kwargs):
	instance.picture.delete(False)
@receiver(post_delete, sender=Section)
def section_delete(sender, instance, **kwargs):
	instance.header.delete(False)
@receiver(post_delete, sender=SectionImage)
def section_image_delete(sender, instance, **kwargs):
	instance.image.delete(False)
@receiver(post_delete, sender=SubSectionCategory)
def category_delete(sender, instance, **kwargs):
	instance.image.delete(False)
@receiver(post_delete, sender=GalleryPhoto)
def gallery_delete(sender, instance, **kwargs):
	instance.image.delete(False)
@receiver(post_delete, sender=Member)
def member_delete(sender, instance, **kwargs):
	instance.image.delete(False)
@receiver(post_delete, sender=Event)
def event_delete(sender, instance, **kwargs):
	instance.image.delete(False)
	instance.program.delete(False)