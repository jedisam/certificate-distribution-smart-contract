#!/usr/bin/env python
"""Setup script for the py-pip-install-test package."""

from setuptools import setup, find_packages

with open('README.md') as readme_file:
    readme = readme_file.read()

requirements = ['pytest==7.1.1']

test_requirements = ['pandas', 'matplotlib', 'alogorand-sdk',
                     , 'sql', 'pytest>=3', ]

setup(
    author="Yididiya",
    email="yidisam18@gmail.com",
    python_requires='>=3.6',
    description="Web3 project",
    install_requires=requirements,
    long_description=readme,
    include_package_data=True,
    keywords='blockchain, algorand, decentralized, pytest',
    name='W3',
    packages=find_packages(include=['src', 'src.*']),
    test_suite='Tests',
    tests_require=test_requirements,
    url='https://github.com/abtesting10academy/W3',
    version='0.1.0',
    zip_safe=False,
)
